/**
 * 数据提取脚本 — 从蓝桥杯 Finder 项目中提取上海第二工业大学的获奖数据
 * 用法: node scripts/extract-sspu.js
 * 输出: data/lanqiao-sspu.json
 */

const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "../../C16H22O4.github.io-main/data");
const OUT = path.resolve(__dirname, "../data/lanqiao-sspu.json");
const SCHOOL_ID = 608;
const PERSON_SHARD_SIZE = 5000;
const DETAIL_SHARD_SIZE = 5000;

// 读取 JSON 文件
function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(SRC, relPath), "utf-8"));
}

// 计算分片号
function personShard(rowNo) {
  return Math.max(0, Math.floor((Number(rowNo) - 1) / PERSON_SHARD_SIZE));
}
function detailShard(pid) {
  return Math.max(0, Math.floor((Number(pid) - 1) / DETAIL_SHARD_SIZE));
}

// 届次标签
function editionLabel(n) {
  const digits = ["零","一","二","三","四","五","六","七","八","九","十"];
  n = Number(n);
  let text = String(n);
  if (n <= 10) text = digits[n] || text;
  else if (n < 20) text = `十${digits[n % 10]}`;
  return `第${text}届`;
}

async function main() {
  console.log("正在读取字典数据...");
  const dict = readJson("dict.json");

  // 构建查找表
  const provinceMap = new Map(dict.provinces.map(p => [p[0], p[1]]));
  const subjectMap = new Map(dict.subjects.map(s => [s[0], s[4]]));
  const awardMap = dict.awards; // { "0": "特等奖", "1": "一等奖", ... }

  console.log("正在读取 SSPU 选手列表...");
  const rowNos = readJson("schools/608.json");
  console.log(`共 ${rowNos.length} 名选手`);

  // 计算需要读取的分片
  const shards = new Set(rowNos.map(personShard));
  console.log(`涉及 ${shards.size} 个人员分片`);

  // 读取人员分片
  const personMap = new Map();
  for (const shard of shards) {
    const items = readJson(`people/${shard}.json`);
    for (const item of items) {
      if (item[4] === SCHOOL_ID) {
        personMap.set(item[1], {
          rowNo: item[0],
          pid: item[1],
          id: item[2],
          name: item[3],
          schoolId: item[4],
          nationalFirst: item[5] || 0,
          nationalSecond: item[6] || 0,
          nationalThird: item[7] || 0,
          provincialFirst: item[8] || 0,
          provincialSecond: item[9] || 0,
          provincialThird: item[10] || 0,
          total: item[11] || 0,
          bonus: item[12] || 0,
        });
      }
    }
  }
  console.log(`匹配到 ${personMap.size} 名 SSPU 选手`);

  // 读取详情分片
  const detailShards = new Set();
  for (const pid of personMap.keys()) {
    detailShards.add(detailShard(pid));
  }
  console.log(`涉及 ${detailShards.size} 个详情分片`);

  const detailMap = new Map();
  for (const shard of detailShards) {
    const items = readJson(`details/${shard}.json`);
    for (const item of items) {
      if (personMap.has(item[0])) {
        detailMap.set(item[0], item[1]);
      }
    }
  }

  // 组装最终数据
  const persons = [];
  const stats = {
    totalContestants: 0,
    totalRecords: 0,
    nationalFirst: 0,
    nationalSecond: 0,
    nationalThird: 0,
    provincialFirst: 0,
    provincialSecond: 0,
    provincialThird: 0,
    byEdition: {},
    byLanguage: {},
  };

  for (const [pid, person] of personMap) {
    const records = (detailMap.get(pid) || []).map(r => ({
      edition: r[0],
      editionLabel: editionLabel(r[0]),
      scope: r[1] === 1 ? "省赛" : "国赛",
      scopeCode: r[1],
      provinceId: r[2],
      province: provinceMap.get(r[2]) || "",
      regionId: r[3],
      rank: r[4] || 0,
      subjectId: r[5],
      subject: subjectMap.get(r[5]) || "",
      award: awardMap[String(r[6])] || "",
      awardCode: r[6],
    }));

    persons.push({ ...person, records });

    // 统计
    stats.totalContestants++;
    stats.totalRecords += person.total;
    stats.nationalFirst += person.nationalFirst;
    stats.nationalSecond += person.nationalSecond;
    stats.nationalThird += person.nationalThird;
    stats.provincialFirst += person.provincialFirst;
    stats.provincialSecond += person.provincialSecond;
    stats.provincialThird += person.provincialThird;

    for (const rec of records) {
      // 按届次统计
      if (!stats.byEdition[rec.editionLabel]) {
        stats.byEdition[rec.editionLabel] = { total: 0, first: 0, second: 0, third: 0 };
      }
      stats.byEdition[rec.editionLabel].total++;
      if (rec.awardCode <= 1) stats.byEdition[rec.editionLabel].first++;
      else if (rec.awardCode === 2) stats.byEdition[rec.editionLabel].second++;
      else stats.byEdition[rec.editionLabel].third++;

      // 按语言统计
      const lang = rec.subject.split("程序设计")[0] || rec.subject;
      if (!stats.byLanguage[lang]) {
        stats.byLanguage[lang] = { total: 0, first: 0, second: 0, third: 0 };
      }
      stats.byLanguage[lang].total++;
      if (rec.awardCode <= 1) stats.byLanguage[lang].first++;
      else if (rec.awardCode === 2) stats.byLanguage[lang].second++;
      else stats.byLanguage[lang].third++;
    }
  }

  // 按奖项优先级排序：国一 > 国二 > 国三 > 省一 > 省二 > 省三 > 总计
  const sortKeys = ["nationalFirst", "nationalSecond", "nationalThird", "provincialFirst", "provincialSecond", "provincialThird", "total"];
  persons.sort((a, b) => {
    for (const key of sortKeys) {
      const diff = (b[key] || 0) - (a[key] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  });

  const output = {
    school: "上海第二工业大学",
    schoolId: SCHOOL_ID,
    generatedAt: new Date().toISOString(),
    stats,
    persons,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(output), "utf-8");
  console.log(`\n提取完成！输出: ${OUT}`);
  console.log(`  选手数: ${stats.totalContestants}`);
  console.log(`  国一: ${stats.nationalFirst}  国二: ${stats.nationalSecond}  国三: ${stats.nationalThird}`);
  console.log(`  省一: ${stats.provincialFirst}  省二: ${stats.provincialSecond}  省三: ${stats.provincialThird}`);
}

main().catch(err => {
  console.error("提取失败:", err);
  process.exit(1);
});
