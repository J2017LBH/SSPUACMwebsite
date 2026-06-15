"""
从 xcpcrating 导出的 JSON 中提取上海第二工业大学 (SSPU) 的 XCPC 数据，
生成精简的 sspu-data.json 供 acmwebsite 使用。

用法: python scripts/extract_sspu.py [--xcpc-data PATH] [--out PATH]
默认: --xcpc-data D:/Code/xcpcrating-main/web/public/data --out data/sspu-data.json
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

SSPU_KEYWORD = "第二工业"


def md5_shard(key: str) -> str:
    return hashlib.md5(key.encode("utf-8")).hexdigest()[:2]


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(description="Extract SSPU data from xcpcrating")
    parser.add_argument(
        "--xcpc-data",
        default=os.environ.get(
            "XCPC_DATA_PATH",
            os.path.join(os.path.dirname(__file__), "..", "..", "xcpcrating-main", "web", "public", "data"),
        ),
        help="Path to xcpcrating exported data directory",
    )
    parser.add_argument(
        "--out",
        default="data/sspu-data.json",
        help="Output path for SSPU data JSON (relative to acmwebsite root)",
    )
    args = parser.parse_args()

    data_dir = args.xcpc_data
    if not os.path.isdir(data_dir):
        print(f"Error: data directory not found: {data_dir}", file=sys.stderr)
        sys.exit(1)

    # 1. Load leaderboard (all-participation) for player ranking
    print("Loading leaderboard...")
    leaderboard = load_json(os.path.join(data_dir, "leaderboard.json"))
    lb_official = load_json(os.path.join(data_dir, "leaderboard_official.json"))

    sspu_lb = [p for p in leaderboard if SSPU_KEYWORD in p.get("org", "")]
    sspu_lb_official = [p for p in lb_official if SSPU_KEYWORD in p.get("org", "")]

    # Build lookup: key -> official rating
    official_map = {p["key"]: p for p in sspu_lb_official}

    # 2. Load players-index for additional metadata
    print("Loading players index...")
    players_index = load_json(os.path.join(data_dir, "players-index.json"))
    # rows: [key, name, org, contests, rating]

    sspu_keys = set()
    for row in players_index:
        key, name, org, contests, rating = row[0], row[1], row[2], row[3], row[4]
        if SSPU_KEYWORD in org:
            sspu_keys.add(key)

    print(f"Found {len(sspu_keys)} SSPU players")

    # 3. Load player details from shards
    print("Loading player details from shards...")
    shards_needed = set()
    for key in sspu_keys:
        shards_needed.add(md5_shard(key))

    player_details = {}
    for shard in sorted(shards_needed):
        shard_path = os.path.join(data_dir, "players", f"{shard}.json")
        if not os.path.exists(shard_path):
            print(f"  Warning: shard {shard}.json not found", file=sys.stderr)
            continue
        shard_data = load_json(shard_path)
        for key in sspu_keys:
            if key in shard_data:
                player_details[key] = shard_data[key]

    print(f"Loaded details for {len(player_details)} players")

    # 4. Load contests index and find SSPU contests
    print("Loading contests...")
    contests_index = load_json(os.path.join(data_dir, "contests-index.json"))

    sspu_contests = []
    for c in contests_index:
        slug = c["slug"]
        contest_path = os.path.join(data_dir, "contests", f"{slug}.json")
        if not os.path.exists(contest_path):
            continue
        contest_detail = load_json(contest_path)
        teams = contest_detail.get("teams", [])
        sspu_teams = [t for t in teams if SSPU_KEYWORD in t.get("org", "")]
        if not sspu_teams:
            continue

        # Extract SSPU team info
        team_info = []
        for t in sspu_teams:
            members = [m["name"] for m in t.get("members", [])]
            team_info.append({
                "rank": t["rank"],
                "name": t["name"],
                "solved": t.get("solved", 0),
                "penalty": t.get("penalty", 0),
                "official": t.get("official", True),
                "members": members,
            })

        sspu_contests.append({
            "id": c["id"],
            "slug": slug,
            "title": c["title"],
            "startAt": c["startAt"],
            "category": c["category"],
            "teamCount": c["teamCount"],
            "champion": c.get("champion", {}),
            "unrated": c.get("unrated", False),
            "sspuTeams": team_info,
        })

    print(f"Found {len(sspu_contests)} contests with SSPU participation")

    # 5. Build player leaderboard with rank
    players_sorted = sorted(sspu_lb, key=lambda p: p["rating"], reverse=True)
    players_list = []
    for i, p in enumerate(players_sorted):
        key = p["key"]
        official = official_map.get(key, {})
        detail = player_details.get(key, {})
        medals = detail.get("medals", {})
        players_list.append({
            "rank": i + 1,
            "key": key,
            "name": p["name"],
            "org": p["org"],
            "rating": round(p["rating"], 1),
            "ratingOfficial": round(official.get("rating", 0), 1) if official else None,
            "contests": p["contests"],
            "medals": medals if medals else None,
        })

    # 6. Build player history for detail view
    player_histories = {}
    for key, detail in player_details.items():
        history = detail.get("history", [])
        player_histories[key] = [
            {
                "contestId": h.get("contestId", ""),
                "title": h.get("title", ""),
                "startAt": h.get("startAt", ""),
                "teamName": h.get("teamName", ""),
                "rank": h.get("rank", 0),
                "teamCount": h.get("teamCount", 0),
                "official": h.get("official", True),
                "rated": h.get("rated", True),
                "perf": h.get("perf", 0),
                "rating_after": h.get("rating_after"),
                "mu_after": h.get("mu_after"),
            }
            for h in history
        ]

    # 7. Compute aggregate stats
    total_medals = {"gold": 0, "silver": 0, "bronze": 0}
    for p in players_list:
        if p.get("medals"):
            for tier_medals in p["medals"].values():
                if isinstance(tier_medals, dict):
                    total_medals["gold"] += tier_medals.get("gold", 0)
                    total_medals["silver"] += tier_medals.get("silver", 0)
                    total_medals["bronze"] += tier_medals.get("bronze", 0)

    stats = {
        "totalPlayers": len(players_list),
        "totalContests": len(sspu_contests),
        "topRating": players_list[0]["rating"] if players_list else 0,
        "totalMedals": total_medals,
    }

    # 8. Sort contests by date (newest first)
    sspu_contests.sort(key=lambda c: c["startAt"], reverse=True)

    # 9. Assemble output
    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "xcpc-rating (https://github.com/algoux/xcpc-rating)",
        "school": "上海第二工业大学",
        "stats": stats,
        "players": players_list,
        "contests": sspu_contests,
        "playerDetails": player_histories,
    }

    # 10. Write output
    out_path = args.out
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = os.path.getsize(out_path) / 1024
    print(f"\nOutput: {out_path} ({size_kb:.1f} KB)")
    print(f"  Players: {stats['totalPlayers']}")
    print(f"  Contests: {stats['totalContests']}")
    print(f"  Top rating: {stats['topRating']}")
    print(f"  Medals: {total_medals}")


if __name__ == "__main__":
    main()
