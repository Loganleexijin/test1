# 1. 文档信息

- 文档名称：Flux 首次启动页（Onboarding）信息收集 PRD
- 适用端：iOS / Android
- 目标版本：V1.0
- 负责人：产品/交互/视觉/客户端/后端/数据
- 相关页面风格参照：你提供的首页截图（暖白背景、橙色强调、蓝色主按钮、圆角卡片、底部导航）

---

# 2. 背景与目标

## 2.1 背景

当前 App 已有计时首页，但缺少首启启动页与基础信息收集，导致：

- 无法生成个性化断食窗口与提醒策略
- 无法做健康风险拦截
- 无法根据三餐规律安排进食窗，造成“推荐不贴生活 → 流失”

## 2.2 目标

首启 60–90 秒完成“最小可用画像”，支持：

1. 输出可执行的起步断食计划（时长 + 进食窗建议）
2. 建立提醒策略（通知/闹钟）
3. 风险筛查：不适合断食的人群切换为安全模式
4. 支持女性在完成后进入“周期同步”（可跳过，后置增强）

---

# 3. 设计风格与视觉规范（与截图统一）

> 以下为建议 Design Token（可直接给 UI/前端用），来源于截图的主色观感与常见色阶匹配。
> 

## 3.1 色彩（Color Tokens）

- **App 背景（暖白）**：`#FFF7ED`（暖白底）/ 纯白 `#FFFFFF`（卡片底）
- **主强调橙（进度/状态/重点字）**：`#F49E24`
- **次强调橙（高饱和提醒/点缀）**：`#F97317`（谨慎使用）
- **主操作蓝（Primary CTA / 选中态）**：`#2463EB`
- **分割线/描边灰**：`#F3F4F6`
- **主文字黑**：`#101828`
- **次级文字灰**（说明/占位）：建议 `#667085`

## 3.2 字体与层级

- 页面标题：24–28 Semibold
- 步骤主问题：18–20 Semibold
- 选项卡片标题：16 Medium
- 说明文字/提示：12–14 Regular
- 错误提示：12–14 Regular（颜色用橙或灰，不用大红恐吓）

## 3.3 布局与圆角（与截图一致）

- 页面左右边距：16
- 卡片圆角：16
- 按钮圆角：14–16（胶囊感）
- 卡片阴影：极轻（或仅描边 `#F3F4F6`）
- 页面结构：
    
    顶部：Logo/进度 → 中间：问题+输入卡片 → 底部：固定主按钮（Primary）
    

## 3.4 动效与触感

- 页面切换：280–320ms ease-out
- 卡片选中：scale 1.00 → 1.02（120ms）
- 主按钮点击：轻微下压（80ms）
- Haptic：选中/完成用 light impact（可选）

---

# 4. 首启流程与页面清单

## 4.1 总流程（First Run）

1. Splash（品牌/加载）
2. Welcome（价值一句话 + 隐私承诺，1页即可）
3. Step1：断食目的（Why）
4. Step2：身高体重年龄性别（Body Basics）
5. Step3：影响因素（活动水平 + 断食经验）
6. Step4：三餐规律与作息（Schedule）
7. Step5：健康风险筛查（Safety Gate）
8. Step6：生成推荐计划（Plan Output + 提醒方式）
9. Finish：确认并进入首页（可选引导：女性周期同步）

> 任何一步允许退出 App；再次进入时继续上次步骤（本地缓存）。
> 

---

# 5. 页面级详细需求（含文案、交互、value 值）

下面每一步都包含：**字段、value、文案、交互、校验、埋点建议**。

---

## 0）Splash 启动页（系统 Launch Screen + App Loading）

**目的**：品牌露出 + 初始化配置（本地/远程配置/权限检查）

- 元素：Logo「Flux」+ 暖白背景渐变（很轻）
- 动效：Logo 呼吸 1.2s 循环（可选）
- 超时：>2.5s 显示小字：`正在准备你的计划…`
- 6s：显示按钮：`重试` / `离线继续`（离线使用默认推荐 12:12）

---

## 1）Welcome（1页即可，短）

**标题**：`Flux 让断食更容易坚持`

**说明**：`我们会根据你的身体与作息，推荐更适合你的起步计划。`

**隐私小字**：`你的数据用于本机个性化与安全提醒，可随时修改。`

**按钮**：`开始设置`

交互：点击进入 Step1

---

## Step1｜为什么选择来断食（必填）

### 字段

- `goal_primary`（string，必填，单选）
- `goal_secondary`（string[]，可选，多选，最多2个）
- `goal_custom_text`（string，可选，当选择 other 时出现）

### value 定义

`goal_primary` 可选值：

- `"weight_loss"`（减脂/体重管理）
- `"metabolic_health"`（控糖/代谢健康）
- `"energy_focus"`（精力与专注）
- `"eating_habit"`（改善饮食规律/减少夜宵）
- `"gut_comfort"`（肠胃舒适/减少胀气）
- `"other"`（其他）

### UI 文案

- 主问题：`你为什么想开始断食？`
- 副说明：`我们会据此推荐更容易坚持的起步计划。`
- 卡片文案（示例）：
    - 减脂/体重管理：`更轻的体感与体型变化`
    - 控糖/代谢健康：`更稳定的能量与食欲`
    - 精力与专注：`更清醒的白天状态`
    - 改善饮食规律/减少夜宵：`从“晚饭后截止”开始`
    - 肠胃舒适/减少胀气：`减少无意识进食`
    - 其他：`告诉我们你的目标`

按钮：

- Primary：`继续`
- Secondary（右上角）：`跳过`（允许，但会使用默认目标 eating_habit）

### 交互规则

- 选择一个主目标后才能点“继续”
- 若选 other：出现输入框 placeholder：`例如：想改善睡眠、减少零食…`

### 校验

- other 必须输入 ≥2 字

---

## Step2｜身高体重年龄性别（身高体重必填）

### 字段

- `height_cm`（int，必填，单位 cm）
- `weight_kg`（float，必填，单位 kg）
- `age`（int，可选但推荐）
- `sex`（string，推荐必填）

### value 定义

`sex`：

- `"female"`
- `"male"`
- `"other"`
- `"prefer_not_to_say"`

### UI 文案

- 主问题：`告诉我一些基础信息`
- 副说明：`用于个性化与安全提醒，你随时可以修改。`
- 输入项：
    - 身高：`身高` placeholder：`例如 165 cm`
    - 体重：`体重` placeholder：`例如 55 kg`
    - 年龄：`年龄（可选）` placeholder：`例如 28`
    - 性别：`性别`（四个胶囊选项）

按钮：

- Primary：`继续`
- Secondary：`跳过年龄`（仅年龄可跳过，身高体重不可跳过）

### 交互规则

- 身高体重支持单位切换（可选）：
    - cm / ft-in；kg / lb（切换时内部统一换算存储为 cm、kg）
- 错误提示就地显示，不弹窗

### 校验建议（可按产品策略调整）

- 身高：`120–220` cm；否则提示：`这个数值看起来不太常见，可以再确认一下`
- 体重：`30–200` kg；同上
- 年龄：`13–80`（<18 或 <13 触发安全策略见 Step5）

---

## Step3｜影响因素（活动水平 + 断食经验）（建议必填）

### 字段

- `activity_level`（string，必填）
- `fasting_experience`（string，必填）
- `training_type`（string[]，可选，多选）

### value 定义

`activity_level`：

- `"sedentary"`（久坐）
- `"light"`（轻度）
- `"moderate"`（中等）
- `"high"`（高）

`fasting_experience`：

- `"beginner"`（新手）
- `"some"`（做过几次）
- `"regular"`（稳定实践者）

`training_type`（可选）：

- `"strength"`（力量）
- `"cardio"`（有氧）
- `"mixed"`（混合）
- `"none"`

### UI 文案

- 主问题：`你的日常活动大概是？`
- 选项解释（小字）：
    - 久坐：`大部分时间坐着`
    - 轻度：`通勤走动 + 偶尔运动`
    - 中等：`每周 3–5 次运动`
    - 高：`高强度训练或体力工作`
- 第二问：`你做过断食吗？`
    - 新手：`第一次系统尝试`
    - 做过几次：`偶尔做，但不稳定`
    - 稳定实践者：`能稳定执行 16:8 等`

按钮：`继续`

### 交互规则

- 两题均必选才能继续
- training_type 是可选展开项（“我有训练习惯”展开多选）

---

## Step4｜三餐规律与作息（必填，但用“区间选择”降低填写成本）

### 字段

- `meal_regularity`（string，必填）
- `late_snack_freq`（string，必填）
- `breakfast_time`（string，必填）
- `lunch_time`（string，必填）
- `dinner_time`（string，必填）
- `sleep_time`（string，必填）

### value 定义

`meal_regularity`：

- `"regular"`（很规律）
- `"semi_regular"`（一般规律）
- `"irregular"`（不规律）

`late_snack_freq`：

- `"rare"`（几乎没有）
- `"1_2_week"`（每周1–2次）
- `"3plus_week"`（每周≥3次）

`breakfast_time`：

- `"7_9"`, `"9_11"`, `"skip"`, `"unstable"`
    
    `lunch_time`：
    
- `"11_13"`, `"13_15"`, `"unstable"`
    
    `dinner_time`：
    
- `"17_19"`, `"19_21"`, `"after_21"`, `"unstable"`
    
    `sleep_time`：
    
- `"before_23"`, `"23_1"`, `"after_1"`

### UI 文案

- 主问题：`你的三餐大概在什么时间？`
- 副说明：`不用很精确，选最接近的即可。`
- 第一组：`三餐规律度`（三选一）
- 第二组：`夜宵频率`（三选一）
- 时间区间 chips：
    - 早餐通常在：`7–9` `9–11` `不吃早餐` `不固定`
    - 午餐通常在：`11–13` `13–15` `不固定`
    - 晚餐通常在：`17–19` `19–21` `21点后` `不固定`
    - 通常入睡：`23点前` `23–1点` `1点后`

按钮：`继续`

### 交互规则

- 每个问题必须选一个
- 若多项选择“不固定”，显示安抚提示条：
    
    `没关系，我们会先给一个更宽松、更好坚持的方案。`
    

---

## Step5｜健康风险筛查（必填，安全闸门）

### 字段

- `safety_flags`（string[]，必填，可为空数组）
- `pregnancy_status`（string，仅女性出现，可选但建议必须回答“是/否/不确定”）

### value 定义

`safety_flags` 复选：

- `"diabetes_med"`（糖尿病/使用降糖药）
- `"eating_disorder_history"`（进食障碍史）
- `"underage"`（未成年人：由年龄判定，也可用户自选）
- `"underweight_risk"`（体重过低风险：系统判定）
- `"ulcer_gastritis"`（胃溃疡/严重胃病）
- `"chronic_disease"`（其他需要医生建议的慢性病）

女性专属 `pregnancy_status`：

- `"no"`
- `"pregnant"`
- `"breastfeeding"`
- `"trying"`（备孕/试孕）
- `"unsure"`

### UI 文案

- 主问题：`为了安全，我们需要确认几件事`
- 副说明：`如果不适合断食，我们会自动切换到更温和的模式。`
- 选项行文（不恐吓）：
    - `我正在使用降糖药/胰岛素`
    - `我有进食障碍相关经历`
    - `我有严重胃病（如胃溃疡）`
    - `我有慢性病，需要医生建议`
    - （系统自动提示）`你可能不适合强断食，我们会更温和开始`

女性出现一题：

- `你目前处于以下状态吗？`
    - `怀孕` `哺乳期` `备孕/试孕` `不确定` `都不是`

按钮：`继续`

### 安全策略（强制逻辑）

命中以下任一条件 → **进入“安全模式”**（禁用强断食计时/只提供温和建议）：

- `diabetes_med`
- `eating_disorder_history`
- `pregnant` / `breastfeeding`
- underage（<18）
- underweight_risk（BMI 过低阈值由医学/策略确定）

触发时展示 Bottom Sheet（与你首页干预风格一致：暖色光晕、圆角卡片）：

- 标题：`我们会为你切换到更安全的模式`
- 正文：`基于你提供的信息，强断食可能不适合你。你仍可使用饮食记录、温和窗口与提醒。`
- 按钮：
    - Primary：`我明白了，继续`
    - Secondary：`查看原因`（展开解释）

---

## Step6｜生成推荐计划 + 提醒方式（必填，输出页）

### 字段（系统生成 + 用户确认）

- `recommended_plan_id`（string）
- `fasting_window_hours`（int）例如 12/13/14/16
- `eating_window_hint`（string）例如 `"12:00–20:00"`（根据 Step4 推断）
- `reminder_mode`（string，必填）
- `start_day`（string）`"today"` / `"tomorrow"`

### value 定义

`reminder_mode`：

- `"notify_only"`（仅通知）
- `"notify_alarm"`（通知+闹钟）
- `"silent"`（静默，仅App内）

`recommended_plan_id`（示例规则，便于AB与追踪）：

- `"plan_12_12_beginner"`
- `"plan_13_11_regular"`
- `"plan_14_10_weight_loss"`
- `"plan_16_8_regular"`

### UI 文案（核心输出）

- 标题：`这是为你推荐的起步计划`
- 推荐卡片：
    - 主推荐（大卡片）：`建议从 12:12 开始（7天）`
    - “为什么适合你”（一行拼接）：
        
        `因为你晚餐偏晚 + 新手，我们先从更温和、容易坚持的窗口开始。`
        
    - 进食窗建议：`建议进食时间：12:00–20:00`（可点编辑）
- 提醒方式标题：`你希望我们怎么提醒你？`
    - `"notify_only"`：`温柔提醒，不打扰`
    - `"notify_alarm"`：`更强提醒，适合容易忘`
    - `"silent"`：`我自己掌控节奏`
- 开始时间：`从什么时候开始？`
    
    chips：`今天` / `明天`
    

按钮：

- Primary：`确认并进入 Flux`
- Secondary：`调整计划`（进入简单调整：12/13/14/16 选一项，或仅在非安全模式下开放）

---

## Finish｜完成页（可选合并到 Step6 底部）

- 文案：`设置完成！`
- 小字：`你随时可以在「我的-设置」修改身高体重、目标与提醒。`
- 女性用户额外入口（可跳过）：
    - 卡片：`开启周期同步（可让建议更贴合状态）`
    - 按钮：`现在开启` / `稍后再说`

---

# 6. 数据结构（统一字段命名，便于前后端/埋点）

建议本地保存一个对象：`onboarding_profile_v1`

```json
{
  "goal_primary": "eating_habit",
  "goal_secondary": ["energy_focus"],
  "goal_custom_text": "",
  "height_cm": 165,
  "weight_kg": 55.0,
  "age": 28,
  "sex": "female",
  "activity_level": "light",
  "fasting_experience": "beginner",
  "training_type": ["none"],
  "meal_regularity": "semi_regular",
  "late_snack_freq": "1_2_week",
  "breakfast_time": "9_11",
  "lunch_time": "11_13",
  "dinner_time": "19_21",
  "sleep_time": "23_1",
  "pregnancy_status": "no",
  "safety_flags": [],
  "recommended_plan_id": "plan_12_12_beginner",
  "fasting_window_hours": 12,
  "eating_window_hint": "12:00–20:00",
  "reminder_mode": "notify_only",
  "start_day": "tomorrow"
}

```

---

# 7. 全局交互规范（你给图的布局一致性）

- 顶部：Logo「Flux」左上；右上可放“跳过”（仅非安全必填步骤）
- 中部：问题文本 + 卡片/Chips
- 底部：固定主按钮（蓝色 `#2463EB`），禁用态改为浅灰底 + 灰字
- 卡片选中态：边框蓝色/浅蓝底，或轻微阴影 + 蓝色点缀
- 强调信息（如状态/关键提醒）：使用橙色 `#F49E24`（与首页“血糖上升期”同气质）

---

# 8. 埋点（建议）

每一步都至少记录：

- `onboarding_step_view`（step_id）
- `onboarding_step_complete`（step_id, duration_ms）
- `onboarding_drop`（step_id）
- 字段选择事件（goal/activity/meal 等）
- 安全模式触发：`safety_gate_triggered`（flags）

---

# 9. 验收标准（QA Checklist）

1. 60–90 秒能走完完整流程（无崩溃、无强制键盘卡死）
2. 必填项不填无法继续；错误提示就地出现
3. 安全模式触发时：必须禁用强断食计时入口，并给出替代方案提示
4. 推荐计划生成与用户输入一致（晚餐很晚不推荐“过早截止”）
5. 再次打开 App：未完成 onboarding 能继续上次步骤
6. 深色模式（若支持）：对比度可读、橙蓝不刺眼

---
