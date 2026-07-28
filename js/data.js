// ============================================================
// 课程数据 - 一年级语文、数学、英语
// 每科20页，每页包含3-5道题
// ============================================================

const CURRICULUM = {
  // ==================== 语文 ====================
  chinese: {
    name: "语文",
    icon: "📖",
    color: "#FF6B6B",
    colorLight: "#FFE0E0",
    pages: [
      {
        title: "拼音 a o e",
        type: "pinyin",
        questions: [
          { q: "哪个是'a'的读音？", options: ["啊", "哦", "鹅", "衣"], answer: 0 },
          { q: "哪个是'o'的读音？", options: ["啊", "哦", "鹅", "乌"], answer: 1 },
          { q: "哪个是'e'的读音？", options: ["啊", "哦", "鹅", "鱼"], answer: 2 },
          { q: "'a o e'中排第一的是？", options: ["a", "o", "e"], answer: 0 },
        ]
      },
      {
        title: "拼音 i u ü",
        type: "pinyin",
        questions: [
          { q: "'i'的读音是？", options: ["衣", "乌", "鱼", "啊"], answer: 0 },
          { q: "'u'的读音是？", options: ["衣", "乌", "鱼", "哦"], answer: 1 },
          { q: "'ü'的读音是？", options: ["衣", "乌", "鱼", "鹅"], answer: 2 },
          { q: "下面哪个是元音？", options: ["i", "b", "p", "m"], answer: 0 },
        ]
      },
      {
        title: "声母 b p m f",
        type: "pinyin",
        questions: [
          { q: "'b'的读音是？", options: ["波", "坡", "摸", "佛"], answer: 0 },
          { q: "'p'的读音是？", options: ["波", "坡", "摸", "佛"], answer: 1 },
          { q: "'m'的读音是？", options: ["波", "坡", "摸", "佛"], answer: 2 },
          { q: "'f'的读音是？", options: ["波", "坡", "摸", "佛"], answer: 3 },
        ]
      },
      {
        title: "声母 d t n l",
        type: "pinyin",
        questions: [
          { q: "'d'的读音是？", options: ["得", "特", "呢", "勒"], answer: 0 },
          { q: "'t'的读音是？", options: ["得", "特", "呢", "勒"], answer: 1 },
          { q: "'n'的读音是？", options: ["得", "特", "呢", "勒"], answer: 2 },
          { q: "'l'的读音是？", options: ["得", "特", "呢", "勒"], answer: 3 },
        ]
      },
      {
        title: "生字：一二三四五",
        type: "character",
        questions: [
          { q: "'一'有几画？", options: ["1画", "2画", "3画", "4画"], answer: 0 },
          { q: "'二'有几画？", options: ["1画", "2画", "3画", "4画"], answer: 1 },
          { q: "'三'有几画？", options: ["1画", "2画", "3画", "4画"], answer: 2 },
          { q: "'四'有几画？", options: ["3画", "4画", "5画", "6画"], answer: 2 },
          { q: "'五'有几画？", options: ["3画", "4画", "5画", "6画"], answer: 3 },
        ]
      },
      {
        title: "生字：上下左右",
        type: "character",
        questions: [
          { q: "头的方向是？", options: ["上", "下", "左", "右"], answer: 0 },
          { q: "脚的方向是？", options: ["上", "下", "左", "右"], answer: 1 },
          { q: "拿笔的手通常是？", options: ["上", "下", "左", "右"], answer: 3 },
          { q: "'上'的反义词是？", options: ["上", "下", "左", "右"], answer: 1 },
        ]
      },
      {
        title: "生字：日月水火",
        type: "character",
        questions: [
          { q: "白天天上有什么？", options: ["日", "月", "水", "火"], answer: 0 },
          { q: "晚上天上有什么？", options: ["日", "月", "水", "火"], answer: 1 },
          { q: "洗手要用什么？", options: ["日", "月", "水", "火"], answer: 2 },
          { q: "做饭要用什么？", options: ["日", "月", "水", "火"], answer: 3 },
        ]
      },
      {
        title: "生字：山石田土",
        type: "character",
        questions: [
          { q: "高高的什么？", options: ["山", "石", "田", "土"], answer: 0 },
          { q: "小小的什么？", options: ["山", "石", "田", "土"], answer: 1 },
          { q: "种稻子的什么？", options: ["山", "石", "田", "土"], answer: 2 },
          { q: "地上的什么？", options: ["山", "石", "田", "土"], answer: 3 },
        ]
      },
      {
        title: "词语：大小多少",
        type: "word",
        questions: [
          { q: "大象很____，蚂蚁很____", options: ["大、小", "小、大", "多、少", "少、多"], answer: 0 },
          { q: "'大'的反义词是？", options: ["大", "小", "多", "少"], answer: 1 },
          { q: "'多'的反义词是？", options: ["大", "小", "多", "少"], answer: 3 },
          { q: "10个苹果比3个苹果____", options: ["大", "小", "多", "少"], answer: 2 },
        ]
      },
      {
        title: "词语：前后左右",
        type: "word",
        questions: [
          { q: "'前'的反义词是？", options: ["前", "后", "左", "右"], answer: 1 },
          { q: "'左'的反义词是？", options: ["前", "后", "左", "右"], answer: 3 },
          { q: "排队时，前面的人在你的____方", options: ["前", "后", "左", "右"], answer: 0 },
          { q: "走路靠____走", options: ["前", "后", "左", "右"], answer: 3 },
        ]
      },
      {
        title: "词语：春夏秋冬",
        type: "word",
        questions: [
          { q: "天气最热的季节是？", options: ["春", "夏", "秋", "冬"], answer: 1 },
          { q: "下雪的季节是？", options: ["春", "夏", "秋", "冬"], answer: 3 },
          { q: "树叶变黄的季节是？", options: ["春", "夏", "秋", "冬"], answer: 2 },
          { q: "花儿开放的季节是？", options: ["春", "夏", "秋", "冬"], answer: 0 },
        ]
      },
      {
        title: "句子：我是小学生",
        type: "sentence",
        questions: [
          { q: "'我是一名____学生'", options: ["大", "小", "中", "老"], answer: 1 },
          { q: "早上见到老师要说？", options: ["再见", "你好", "晚安", "谢谢"], answer: 1 },
          { q: "别人帮助你要说？", options: ["你好", "再见", "谢谢", "对不起"], answer: 2 },
          { q: "做错事要说？", options: ["你好", "谢谢", "对不起", "再见"], answer: 2 },
        ]
      },
      {
        title: "课文：小小的船",
        type: "reading",
        questions: [
          { q: "'小小的船'指的是？", options: ["小船", "月亮", "星星", "太阳"], answer: 1 },
          { q: "月亮弯弯像什么？", options: ["太阳", "小船", "星星", "云朵"], answer: 1 },
          { q: "天上有什么一闪一闪？", options: ["月亮", "太阳", "星星", "云朵"], answer: 2 },
        ]
      },
      {
        title: "课文：秋天",
        type: "reading",
        questions: [
          { q: "秋天树叶会怎样？", options: ["变绿", "变黄", "开花", "长大"], answer: 1 },
          { q: "秋天大雁往哪飞？", options: ["东", "西", "南", "北"], answer: 2 },
          { q: "秋天天气怎样？", options: ["很热", "很冷", "凉快", "下雨"], answer: 2 },
        ]
      },
      {
        title: "偏旁：口字旁",
        type: "radical",
        questions: [
          { q: "哪个字有口字旁？", options: ["吃", "树", "花", "水"], answer: 0 },
          { q: "哪个字有口字旁？", options: ["山", "叫", "天", "地"], answer: 1 },
          { q: "'唱'字的偏旁是？", options: ["口", "日", "土", "木"], answer: 0 },
          { q: "'听'字的偏旁是？", options: ["口", "日", "土", "木"], answer: 0 },
        ]
      },
      {
        title: "偏旁：木字旁",
        type: "radical",
        questions: [
          { q: "哪个字有木字旁？", options: ["吃", "树", "花", "水"], answer: 1 },
          { q: "哪个字有木字旁？", options: ["山", "叫", "林", "地"], answer: 2 },
          { q: "'桃'字的偏旁是？", options: ["口", "木", "土", "水"], answer: 1 },
          { q: "'桥'字的偏旁是？", options: ["口", "木", "土", "水"], answer: 1 },
        ]
      },
      {
        title: "古诗：咏鹅",
        type: "poem",
        questions: [
          { q: "'咏鹅'是谁写的？", options: ["李白", "骆宾王", "杜甫", "白居易"], answer: 1 },
          { q: "'鹅鹅鹅'后面是？", options: ["曲项向天歌", "白毛浮绿水", "红掌拨清波", "向天歌一曲"], answer: 0 },
          { q: "'白毛浮____'", options: ["蓝天", "绿水", "白云", "清水"], answer: 1 },
          { q: "'红掌拨____'", options: ["清波", "绿水", "蓝天", "白云"], answer: 0 },
        ]
      },
      {
        title: "古诗：静夜思",
        type: "poem",
        questions: [
          { q: "'静夜思'是谁写的？", options: ["李白", "骆宾王", "杜甫", "白居易"], answer: 0 },
          { q: "'床前明月____'", options: ["光", "亮", "白", "霜"], answer: 0 },
          { q: "诗人在思念什么？", options: ["朋友", "故乡", "老师", "同学"], answer: 1 },
          { q: "'低头思____'", options: ["朋友", "故乡", "老师", "同学"], answer: 1 },
        ]
      },
      {
        title: "标点符号",
        type: "punctuation",
        questions: [
          { q: "一句话说完用什么？", options: ["。", "，", "？", "！"], answer: 0 },
          { q: "提问用什么？", options: ["。", "，", "？", "！"], answer: 2 },
          { q: "表示感叹用什么？", options: ["。", "，", "？", "！"], answer: 3 },
          { q: "句子中间停顿用什么？", options: ["。", "，", "？", "！"], answer: 1 },
        ]
      },
      {
        title: "词语分类",
        type: "category",
        questions: [
          { q: "哪个是水果？", options: ["白菜", "苹果", "猪肉", "米饭"], answer: 1 },
          { q: "哪个是动物？", options: ["桌子", "椅子", "小猫", "书本"], answer: 2 },
          { q: "哪个是颜色？", options: ["红色", "桌子", "跑步", "吃饭"], answer: 0 },
          { q: "哪个是文具？", options: ["苹果", "铅笔", "小猫", "衣服"], answer: 1 },
        ]
      },
    ]
  },

  // ==================== 数学 ====================
  math: {
    name: "数学",
    icon: "🔢",
    color: "#4ECDC4",
    colorLight: "#D0F5F0",
    pages: [
      {
        title: "认识1-5",
        type: "number",
        questions: [
          { q: "2后面的数是？", options: ["1", "2", "3", "4"], answer: 2 },
          { q: "4前面的数是？", options: ["1", "2", "3", "5"], answer: 2 },
          { q: "1和3中间的数是？", options: ["1", "2", "3", "4"], answer: 1 },
          { q: "5前面的数是？", options: ["1", "2", "3", "4"], answer: 3 },
        ]
      },
      {
        title: "认识6-10",
        type: "number",
        questions: [
          { q: "7后面的数是？", options: ["6", "7", "8", "9"], answer: 2 },
          { q: "9前面的数是？", options: ["6", "7", "8", "10"], answer: 2 },
          { q: "10前面的数是？", options: ["7", "8", "9", "10"], answer: 2 },
          { q: "6和8中间的数是？", options: ["6", "7", "8", "9"], answer: 1 },
        ]
      },
      {
        title: "比大小",
        type: "compare",
        questions: [
          { q: "3 ○ 5，填什么？", options: [">", "<", "="], answer: 1 },
          { q: "7 ○ 4，填什么？", options: [">", "<", "="], answer: 0 },
          { q: "6 ○ 6，填什么？", options: [">", "<", "="], answer: 2 },
          { q: "8 ○ 10，填什么？", options: [">", "<", "="], answer: 1 },
          { q: "9 ○ 2，填什么？", options: [">", "<", "="], answer: 0 },
        ]
      },
      {
        title: "加法：10以内",
        type: "addition",
        questions: [
          { q: "2 + 3 = ?", options: ["4", "5", "6", "7"], answer: 1 },
          { q: "1 + 4 = ?", options: ["4", "5", "6", "3"], answer: 1 },
          { q: "3 + 5 = ?", options: ["7", "8", "9", "6"], answer: 1 },
          { q: "4 + 4 = ?", options: ["7", "8", "9", "10"], answer: 1 },
          { q: "5 + 5 = ?", options: ["9", "10", "11", "8"], answer: 1 },
        ]
      },
      {
        title: "加法：进位",
        type: "addition",
        questions: [
          { q: "6 + 5 = ?", options: ["10", "11", "12", "9"], answer: 1 },
          { q: "7 + 4 = ?", options: ["10", "11", "12", "13"], answer: 1 },
          { q: "8 + 3 = ?", options: ["10", "11", "12", "9"], answer: 1 },
          { q: "9 + 2 = ?", options: ["10", "11", "12", "13"], answer: 1 },
        ]
      },
      {
        title: "减法：10以内",
        type: "subtraction",
        questions: [
          { q: "5 - 2 = ?", options: ["2", "3", "4", "5"], answer: 1 },
          { q: "7 - 3 = ?", options: ["3", "4", "5", "6"], answer: 1 },
          { q: "8 - 4 = ?", options: ["3", "4", "5", "6"], answer: 1 },
          { q: "9 - 5 = ?", options: ["3", "4", "5", "6"], answer: 1 },
          { q: "10 - 3 = ?", options: ["6", "7", "8", "9"], answer: 1 },
        ]
      },
      {
        title: "减法：退位",
        type: "subtraction",
        questions: [
          { q: "12 - 5 = ?", options: ["6", "7", "8", "9"], answer: 1 },
          { q: "13 - 6 = ?", options: ["6", "7", "8", "9"], answer: 1 },
          { q: "15 - 8 = ?", options: ["6", "7", "8", "9"], answer: 1 },
          { q: "11 - 4 = ?", options: ["6", "7", "8", "9"], answer: 1 },
        ]
      },
      {
        title: "混合运算",
        type: "mixed",
        questions: [
          { q: "3 + 4 - 2 = ?", options: ["4", "5", "6", "7"], answer: 1 },
          { q: "8 - 3 + 2 = ?", options: ["6", "7", "8", "9"], answer: 1 },
          { q: "5 + 5 - 4 = ?", options: ["5", "6", "7", "8"], answer: 1 },
          { q: "10 - 6 + 3 = ?", options: ["6", "7", "8", "9"], answer: 1 },
        ]
      },
      {
        title: "认识图形",
        type: "shape",
        questions: [
          { q: "皮球是什么形状？", options: ["圆形", "正方形", "三角形", "长方形"], answer: 0 },
          { q: "课本是什么形状？", options: ["圆形", "正方形", "三角形", "长方形"], answer: 3 },
          { q: "红领巾是什么形状？", options: ["圆形", "正方形", "三角形", "长方形"], answer: 2 },
          { q: "骰子的面是什么形状？", options: ["圆形", "正方形", "三角形", "长方形"], answer: 1 },
        ]
      },
      {
        title: "数一数",
        type: "counting",
        questions: [
          { q: "一只手有几根手指？", options: ["4", "5", "6", "10"], answer: 1 },
          { q: "两只手有几根手指？", options: ["8", "9", "10", "12"], answer: 2 },
          { q: "一星期有几天？", options: ["5", "6", "7", "8"], answer: 2 },
          { q: "一只螃蟹几条腿？", options: ["6", "8", "10", "12"], answer: 1 },
        ]
      },
      {
        title: "认识钟表",
        type: "clock",
        questions: [
          { q: "时针走一圈是几小时？", options: ["6", "12", "24", "60"], answer: 1 },
          { q: "一分钟等于几秒？", options: ["10", "30", "60", "100"], answer: 2 },
          { q: "一天有几小时？", options: ["12", "24", "60", "100"], answer: 1 },
          { q: "分针走一圈是几分？", options: ["30", "60", "12", "24"], answer: 1 },
        ]
      },
      {
        title: "认识人民币",
        type: "money",
        questions: [
          { q: "1元等于几角？", options: ["5", "10", "20", "100"], answer: 1 },
          { q: "1角等于几分？", options: ["5", "10", "20", "100"], answer: 1 },
          { q: "1元等于几分？", options: ["10", "50", "100", "1000"], answer: 2 },
          { q: "买一支铅笔大约要多少钱？", options: ["1分", "5角", "100元", "50元"], answer: 1 },
        ]
      },
      {
        title: "排队问题",
        type: "sequence",
        questions: [
          { q: "小明排第3，小红排第7，中间有几人？", options: ["3", "4", "5", "6"], answer: 0 },
          { q: "从前往后数小红第5，从后往前数她第3，一共有几人？", options: ["6", "7", "8", "9"], answer: 1 },
          { q: "小明前面有4人，后面有3人，一共有几人？", options: ["6", "7", "8", "9"], answer: 2 },
        ]
      },
      {
        title: "凑十法",
        type: "makeTen",
        questions: [
          { q: "9和几凑成10？", options: ["1", "2", "3", "4"], answer: 0 },
          { q: "8和几凑成10？", options: ["1", "2", "3", "4"], answer: 1 },
          { q: "7和几凑成10？", options: ["2", "3", "4", "5"], answer: 1 },
          { q: "6和几凑成10？", options: ["3", "4", "5", "6"], answer: 1 },
        ]
      },
      {
        title: "比多少",
        type: "compareCount",
        questions: [
          { q: "5比3多几个？", options: ["1", "2", "3", "8"], answer: 1 },
          { q: "7比10少几个？", options: ["2", "3", "4", "7"], answer: 1 },
          { q: "8比6多几个？", options: ["1", "2", "3", "4"], answer: 1 },
          { q: "4比9少几个？", options: ["4", "5", "6", "7"], answer: 1 },
        ]
      },
      {
        title: "应用题",
        type: "wordProblem",
        questions: [
          { q: "树上有5只鸟，又飞来3只，共几只？", options: ["7", "8", "9", "10"], answer: 1 },
          { q: "有10个苹果，吃了4个，剩几个？", options: ["4", "5", "6", "7"], answer: 2 },
          { q: "小明有3支铅笔，小红有5支，共几支？", options: ["7", "8", "9", "10"], answer: 1 },
          { q: "8朵花，送给同学2朵，剩几朵？", options: ["4", "5", "6", "7"], answer: 2 },
        ]
      },
      {
        title: "连加连减",
        type: "chainOperation",
        questions: [
          { q: "2 + 3 + 4 = ?", options: ["8", "9", "10", "7"], answer: 1 },
          { q: "10 - 3 - 2 = ?", options: ["4", "5", "6", "7"], answer: 1 },
          { q: "1 + 2 + 3 + 4 = ?", options: ["8", "9", "10", "11"], answer: 2 },
          { q: "9 - 2 - 3 = ?", options: ["3", "4", "5", "6"], answer: 1 },
        ]
      },
      {
        title: "找规律",
        type: "pattern",
        questions: [
          { q: "1, 2, 3, ?, 5", options: ["3", "4", "5", "6"], answer: 1 },
          { q: "2, 4, 6, ?, 10", options: ["7", "8", "9", "10"], answer: 1 },
          { q: "10, 9, 8, ?, 6", options: ["6", "7", "8", "9"], answer: 1 },
          { q: "1, 3, 5, ?, 9", options: ["6", "7", "8", "9"], answer: 1 },
        ]
      },
      {
        title: "认识位置",
        type: "position",
        questions: [
          { q: "□△○，△在□的____边", options: ["左", "右", "上", "下"], answer: 1 },
          { q: "□△○，○在△的____边", options: ["左", "右", "上", "下"], answer: 1 },
          { q: "□△○，□在最____边", options: ["左", "右", "上", "下"], answer: 0 },
          { q: "△在○的____边", options: ["左", "右", "上", "下"], answer: 0 },
        ]
      },
      {
        title: "综合复习",
        type: "review",
        questions: [
          { q: "6 + 7 = ?", options: ["12", "13", "14", "15"], answer: 1 },
          { q: "15 - 8 = ?", options: ["6", "7", "8", "9"], answer: 1 },
          { q: "比10大比12小的数是？", options: ["9", "10", "11", "12"], answer: 2 },
          { q: "3 + 3 + 3 = ?", options: ["6", "8", "9", "10"], answer: 2 },
        ]
      },
    ]
  },

  // ==================== 英语 ====================
  english: {
    name: "英语",
    icon: "🔤",
    color: "#95E1D3",
    colorLight: "#E0F8F4",
    pages: [
      {
        title: "Letters A-E",
        type: "alphabet",
        questions: [
          { q: "Which is 'A'?", options: ["A", "B", "C", "D"], answer: 0 },
          { q: "Which is 'C'?", options: ["A", "B", "C", "D"], answer: 2 },
          { q: "What comes after A?", options: ["A", "B", "C", "D"], answer: 1 },
          { q: "What comes after D?", options: ["C", "D", "E", "F"], answer: 2 },
        ]
      },
      {
        title: "Letters F-J",
        type: "alphabet",
        questions: [
          { q: "Which is 'F'?", options: ["E", "F", "G", "H"], answer: 1 },
          { q: "What comes after G?", options: ["F", "G", "H", "I"], answer: 2 },
          { q: "Which is 'J'?", options: ["H", "I", "J", "K"], answer: 2 },
          { q: "What comes before J?", options: ["H", "I", "J", "K"], answer: 1 },
        ]
      },
      {
        title: "Letters K-O",
        type: "alphabet",
        questions: [
          { q: "Which is 'K'?", options: ["J", "K", "L", "M"], answer: 1 },
          { q: "What comes after M?", options: ["L", "M", "N", "O"], answer: 2 },
          { q: "Which is 'O'?", options: ["M", "N", "O", "P"], answer: 2 },
          { q: "What comes before O?", options: ["M", "N", "O", "P"], answer: 1 },
        ]
      },
      {
        title: "Letters P-T",
        type: "alphabet",
        questions: [
          { q: "Which is 'P'?", options: ["O", "P", "Q", "R"], answer: 1 },
          { q: "What comes after R?", options: ["Q", "R", "S", "T"], answer: 2 },
          { q: "Which is 'T'?", options: ["R", "S", "T", "U"], answer: 2 },
          { q: "What comes before T?", options: ["R", "S", "T", "U"], answer: 1 },
        ]
      },
      {
        title: "Letters U-Z",
        type: "alphabet",
        questions: [
          { q: "Which is 'U'?", options: ["T", "U", "V", "W"], answer: 1 },
          { q: "What comes after W?", options: ["V", "W", "X", "Y"], answer: 2 },
          { q: "Which is 'Z'?", options: ["X", "Y", "Z", "A"], answer: 2 },
          { q: "What is the last letter?", options: ["X", "Y", "Z", "W"], answer: 2 },
        ]
      },
      {
        title: "Colors",
        type: "color",
        questions: [
          { q: "Apple is ___?", options: ["red", "blue", "green", "black"], answer: 0 },
          { q: "Sky is ___?", options: ["red", "blue", "green", "black"], answer: 1 },
          { q: "Grass is ___?", options: ["red", "blue", "green", "black"], answer: 2 },
          { q: "Sun is ___?", options: ["yellow", "blue", "green", "black"], answer: 0 },
        ]
      },
      {
        title: "Numbers 1-5",
        type: "number",
        questions: [
          { q: "One = ?", options: ["1", "2", "3", "4"], answer: 0 },
          { q: "Three = ?", options: ["1", "2", "3", "4"], answer: 2 },
          { q: "Five = ?", options: ["3", "4", "5", "6"], answer: 2 },
          { q: "Two = ?", options: ["1", "2", "3", "4"], answer: 1 },
        ]
      },
      {
        title: "Numbers 6-10",
        type: "number",
        questions: [
          { q: "Six = ?", options: ["5", "6", "7", "8"], answer: 1 },
          { q: "Eight = ?", options: ["7", "8", "9", "10"], answer: 1 },
          { q: "Ten = ?", options: ["8", "9", "10", "11"], answer: 2 },
          { q: "Nine = ?", options: ["7", "8", "9", "10"], answer: 2 },
        ]
      },
      {
        title: "Animals",
        type: "animal",
        questions: [
          { q: "Dog = ?", options: ["猫", "狗", "鸟", "鱼"], answer: 1 },
          { q: "Cat = ?", options: ["猫", "狗", "鸟", "鱼"], answer: 0 },
          { q: "Bird = ?", options: ["猫", "狗", "鸟", "鱼"], answer: 2 },
          { q: "Fish = ?", options: ["猫", "狗", "鸟", "鱼"], answer: 3 },
        ]
      },
      {
        title: "Fruits",
        type: "fruit",
        questions: [
          { q: "Apple = ?", options: ["苹果", "香蕉", "橘子", "葡萄"], answer: 0 },
          { q: "Banana = ?", options: ["苹果", "香蕉", "橘子", "葡萄"], answer: 1 },
          { q: "Orange = ?", options: ["苹果", "香蕉", "橘子", "葡萄"], answer: 2 },
          { q: "Grape = ?", options: ["苹果", "香蕉", "橘子", "葡萄"], answer: 3 },
        ]
      },
      {
        title: "Family",
        type: "family",
        questions: [
          { q: "Father = ?", options: ["妈妈", "爸爸", "姐姐", "哥哥"], answer: 1 },
          { q: "Mother = ?", options: ["妈妈", "爸爸", "姐姐", "哥哥"], answer: 0 },
          { q: "Sister = ?", options: ["妈妈", "爸爸", "姐姐", "哥哥"], answer: 2 },
          { q: "Brother = ?", options: ["妈妈", "爸爸", "姐姐", "哥哥"], answer: 3 },
        ]
      },
      {
        title: "Body Parts",
        type: "body",
        questions: [
          { q: "Head = ?", options: ["手", "脚", "头", "眼睛"], answer: 2 },
          { q: "Hand = ?", options: ["手", "脚", "头", "眼睛"], answer: 0 },
          { q: "Eye = ?", options: ["手", "脚", "头", "眼睛"], answer: 3 },
          { q: "Foot = ?", options: ["手", "脚", "头", "眼睛"], answer: 1 },
        ]
      },
      {
        title: "Greetings",
        type: "greeting",
        questions: [
          { q: "Hello = ?", options: ["再见", "你好", "谢谢", "对不起"], answer: 1 },
          { q: "Goodbye = ?", options: ["再见", "你好", "谢谢", "对不起"], answer: 0 },
          { q: "Thank you = ?", options: ["再见", "你好", "谢谢", "对不起"], answer: 2 },
          { q: "Good morning = ?", options: ["晚安", "早上好", "你好", "再见"], answer: 1 },
        ]
      },
      {
        title: "Classroom",
        type: "classroom",
        questions: [
          { q: "Book = ?", options: ["书", "笔", "椅子", "桌子"], answer: 0 },
          { q: "Pen = ?", options: ["书", "笔", "椅子", "桌子"], answer: 1 },
          { q: "Desk = ?", options: ["书", "笔", "椅子", "桌子"], answer: 3 },
          { q: "Chair = ?", options: ["书", "笔", "椅子", "桌子"], answer: 2 },
        ]
      },
      {
        title: "Actions",
        type: "action",
        questions: [
          { q: "Run = ?", options: ["跑", "走", "跳", "飞"], answer: 0 },
          { q: "Jump = ?", options: ["跑", "走", "跳", "飞"], answer: 2 },
          { q: "Walk = ?", options: ["跑", "走", "跳", "飞"], answer: 1 },
          { q: "Fly = ?", options: ["跑", "走", "跳", "飞"], answer: 3 },
        ]
      },
      {
        title: "Weather",
        type: "weather",
        questions: [
          { q: "Sunny = ?", options: ["晴天", "雨天", "雪天", "风天"], answer: 0 },
          { q: "Rainy = ?", options: ["晴天", "雨天", "雪天", "风天"], answer: 1 },
          { q: "Snowy = ?", options: ["晴天", "雨天", "雪天", "风天"], answer: 2 },
          { q: "Windy = ?", options: ["晴天", "雨天", "雪天", "风天"], answer: 3 },
        ]
      },
      {
        title: "Food",
        type: "food",
        questions: [
          { q: "Rice = ?", options: ["米饭", "面包", "牛奶", "鸡蛋"], answer: 0 },
          { q: "Bread = ?", options: ["米饭", "面包", "牛奶", "鸡蛋"], answer: 1 },
          { q: "Milk = ?", options: ["米饭", "面包", "牛奶", "鸡蛋"], answer: 2 },
          { q: "Egg = ?", options: ["米饭", "面包", "牛奶", "鸡蛋"], answer: 3 },
        ]
      },
      {
        title: "Big & Small",
        type: "adjective",
        questions: [
          { q: "Big = ?", options: ["大", "小", "高", "矮"], answer: 0 },
          { q: "Small = ?", options: ["大", "小", "高", "矮"], answer: 1 },
          { q: "Tall = ?", options: ["大", "小", "高", "矮"], answer: 2 },
          { q: "Short = ?", options: ["大", "小", "高", "矮"], answer: 3 },
        ]
      },
      {
        title: "My Day",
        type: "sentence",
        questions: [
          { q: "I ___ a student.", options: ["am", "is", "are", "be"], answer: 0 },
          { q: "I get up ___ the morning.", options: ["in", "on", "at", "to"], answer: 0 },
          { q: "I go to ___ by bus.", options: ["school", "home", "bed", "play"], answer: 0 },
          { q: "Good ___! (at night)", options: ["morning", "night", "bye", "hello"], answer: 1 },
        ]
      },
      {
        title: "Final Review",
        type: "review",
        questions: [
          { q: "What color is the sun?", options: ["Red", "Yellow", "Blue", "Green"], answer: 1 },
          { q: "How many legs does a cat have?", options: ["Two", "Four", "Six", "Eight"], answer: 1 },
          { q: "I ___ hello to my teacher.", options: ["say", "eat", "run", "fly"], answer: 0 },
          { q: "A book is for ___?", options: ["eating", "reading", "sleeping", "running"], answer: 1 },
        ]
      },
    ]
  }
};

// ============================================================
// 植物配置
// ============================================================
const PLANTS = {
  sunflower: {
    id: "sunflower",
    name: "向日葵",
    emoji: "🌻",
    cost: 50,
    hp: 3,
    desc: "每天产生10点阳光",
    ability: "produce",
    unlockPages: 0,
    color: "#FFD700"
  },
  peashooter: {
    id: "peashooter",
    name: "豌豆射手",
    emoji: "🌱",
    cost: 100,
    hp: 3,
    desc: "发射豌豆攻击僵尸",
    ability: "attack",
    unlockPages: 5,
    damage: 1,
    color: "#66BB6A"
  },
  wallnut: {
    id: "wallnut",
    name: "坚果墙",
    emoji: "🥜",
    cost: 50,
    hp: 6,
    desc: "高血量防御僵尸",
    ability: "defense",
    unlockPages: 10,
    color: "#D4A373"
  },
  snowpea: {
    id: "snowpea",
    name: "寒冰射手",
    emoji: "❄️",
    cost: 175,
    hp: 3,
    desc: "发射冰豆，减慢僵尸",
    ability: "attack_slow",
    unlockPages: 15,
    damage: 1,
    color: "#81D4FA"
  },
  cherrybomb: {
    id: "cherrybomb",
    name: "樱桃炸弹",
    emoji: "🍒",
    cost: 150,
    hp: 1,
    desc: "一次性大范围伤害",
    ability: "bomb",
    unlockPages: 18,
    damage: 5,
    color: "#EF5350"
  }
};

// ============================================================
// 游戏配置
// ============================================================
const GAME_CONFIG = {
  startingSun: 50,
  taskReward: 25,
  correctAnswerBonus: 5,
  zombieBaseHP: 10,
  zombieDamagePerMiss: 1,
  plantBaseHP: 3,
  gridCols: 9,
  gridRows: 3, // 三条赛道：语文、数学、英语
  pagesPerSubject: 20,
  unlockThresholds: [0, 5, 10, 15, 18],
  finalWeaponPages: 20, // 完成全部页数解锁终极武器
};

// 每条赛道对应的科目
const LANE_SUBJECTS = ["chinese", "math", "english"];
