// ============================================================
// 植物大战僵尸 - 学习版
// 游戏核心逻辑
// ============================================================

const Game = {
    // ==================== 游戏状态 ====================
    state: null,
    selectedPlant: null,
    currentQuiz: null,

    // ==================== 初始化 ====================
    init() {
        this.state = {
            sun: GAME_CONFIG.startingSun,
            day: 1,
            plants: [],      // {id, type, lane, col, hp, maxHp}
            zombies: [],     // {id, lane, position, hp, maxHp, eating}
            lanes: LANE_SUBJECTS.map(subject => ({
                subject,
                currentPage: 0,
                zombieHP: GAME_CONFIG.zombieBaseHP,
                zombiePosition: 2, // 百分比，right定位，2=最右边(起点)，越大越靠近左边
                zombieEating: false,
                completedToday: false,
            })),
            tasksCompleted: { chinese: false, math: false, english: false },
            unlockedPlants: ["sunflower"],
            gameStatus: "playing", // playing, won, lost
            totalCompletedPages: 0,
            subjectCompleted: { chinese: false, math: false, english: false },
            zombieIdCounter: 0,
            plantIdCounter: 0,
        };
        this.loadState();
    },

    // ==================== 存档 ====================
    saveState() {
        try {
            localStorage.setItem("pvz_learning_save", JSON.stringify(this.state));
        } catch(e) { console.warn("保存失败", e); }
    },

    loadState() {
        try {
            const saved = localStorage.getItem("pvz_learning_save");
            if (saved) {
                const data = JSON.parse(saved);
                if (data && data.day) {
                    this.state = Object.assign(this.state, data);
                }
            }
        } catch(e) { console.warn("读取失败", e); }
    },

    clearSave() {
        localStorage.removeItem("pvz_learning_save");
    },

    // ==================== 开始游戏 ====================
    start() {
        this.init();
        document.getElementById("startScreen").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");
        document.getElementById("gameOverScreen").classList.add("hidden");
        this.renderAll();
        this.checkUnlocks();
        this.showToast("🌱 欢迎来到花园！先种一棵向日葵吧！", "success");
    },

    restart() {
        this.clearSave();
        this.start();
    },

    // ==================== 渲染 ====================
    renderAll() {
        this.renderBattlefield();
        this.renderPlantShop();
        this.renderTaskPanel();
        this.updateStatusBar();
    },

    renderBattlefield() {
        const bf = document.getElementById("battlefield");
        bf.innerHTML = "";

        this.state.lanes.forEach((lane, laneIdx) => {
            const subject = CURRICULUM[lane.subject];
            const laneEl = document.createElement("div");
            laneEl.className = "lane";
            laneEl.dataset.lane = laneIdx;

            // 赛道标签
            const label = document.createElement("div");
            label.className = "lane-label";
            label.innerHTML = `
                <div class="subject-icon">${subject.icon}</div>
                <div class="subject-name">${subject.name}</div>
                <div class="subject-progress">${lane.currentPage}/${GAME_CONFIG.pagesPerSubject}</div>
            `;
            laneEl.appendChild(label);

            // 格子
            const cells = document.createElement("div");
            cells.className = "lane-cells";
            cells.dataset.lane = laneIdx;

            for (let col = 0; col < GAME_CONFIG.gridCols; col++) {
                const cell = document.createElement("div");
                cell.className = "cell plantable";
                cell.dataset.lane = laneIdx;
                cell.dataset.col = col;
                cell.onclick = () => this.onCellClick(laneIdx, col);
                cells.appendChild(cell);
            }

            // 僵尸
            if (!this.state.subjectCompleted[lane.subject] && lane.currentPage < GAME_CONFIG.pagesPerSubject) {
                const zombie = document.createElement("div");
                zombie.className = "zombie";
                if (lane.zombieEating) zombie.classList.add("eating");
                zombie.id = `zombie-${laneIdx}`;
                zombie.style.right = lane.zombiePosition + "%";
                zombie.innerHTML = `
                    <div class="zombie-hp-bar">
                        <div class="zombie-hp-fill" style="width: ${(lane.zombieHP / GAME_CONFIG.zombieBaseHP) * 100}%"></div>
                    </div>
                    🧟
                `;
                cells.appendChild(zombie);
            }

            laneEl.appendChild(cells);
            bf.appendChild(laneEl);
        });

        // 渲染已种植的植物
        this.state.plants.forEach(plant => {
            this.renderPlant(plant);
        });
    },

    renderPlant(plant) {
        const cell = document.querySelector(`.cell[data-lane="${plant.lane}"][data-col="${plant.col}"]`);
        if (!cell) return;
        cell.classList.add("has-plant");

        const plantConfig = PLANTS[plant.type];
        const hpPercent = (plant.hp / plant.maxHp) * 100;
        let hpClass = "";
        if (hpPercent <= 33) hpClass = "low";
        else if (hpPercent <= 66) hpClass = "medium";

        const plantEl = document.createElement("div");
        plantEl.className = "plant";
        if (hpPercent <= 33) plantEl.classList.add("hp-low");
        plantEl.id = `plant-${plant.id}`;
        plantEl.innerHTML = `
            ${plantConfig.emoji}
            <div class="plant-hp-bar">
                <div class="plant-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
            </div>
        `;
        cell.appendChild(plantEl);
    },

    renderPlantShop() {
        const shop = document.getElementById("plantShop");
        // 保留label
        shop.innerHTML = '<span class="shop-label">🌱 植物商店</span>';

        Object.values(PLANTS).forEach(plant => {
            const card = document.createElement("div");
            card.className = "plant-card";

            const isUnlocked = this.state.unlockedPlants.includes(plant.id);
            const canAfford = this.state.sun >= plant.cost;

            if (!isUnlocked) {
                card.classList.add("locked");
                card.innerHTML = `
                    <div class="plant-emoji">${plant.emoji}</div>
                    <div class="plant-name">${plant.name}</div>
                    <div class="plant-cost">☀️${plant.cost}</div>
                    <div class="lock-overlay">🔒</div>
                    <div class="unlock-text">完成${plant.unlockPages}页解锁</div>
                `;
            } else {
                if (!canAfford) card.classList.add("disabled");
                if (this.selectedPlant === plant.id) card.classList.add("selected");
                card.innerHTML = `
                    <div class="plant-emoji">${plant.emoji}</div>
                    <div class="plant-name">${plant.name}</div>
                    <div class="plant-cost">☀️${plant.cost}</div>
                `;
                card.onclick = () => this.selectPlant(plant.id);
            }

            shop.appendChild(card);
        });
    },

    renderTaskPanel() {
        const panel = document.getElementById("taskPanel");
        panel.innerHTML = "";

        LANE_SUBJECTS.forEach(subjectKey => {
            const subject = CURRICULUM[subjectKey];
            const lane = this.state.lanes.find(l => l.subject === subjectKey);
            const completed = this.state.tasksCompleted[subjectKey];
            const subjectDone = this.state.subjectCompleted[subjectKey];

            const card = document.createElement("div");
            card.className = "task-card";
            if (completed || subjectDone) card.classList.add("completed");

            let pageTitle;
            if (subjectDone) {
                pageTitle = "已通关！🏆";
            } else if (lane.currentPage < GAME_CONFIG.pagesPerSubject) {
                pageTitle = `第${lane.currentPage + 1}页: ${subject.pages[lane.currentPage].title}`;
            } else {
                pageTitle = "已完成全部课程";
            }

            card.innerHTML = `
                <div class="task-icon">${subject.icon}</div>
                <div class="task-info">
                    <div class="task-subject">${subject.name}</div>
                    <div class="task-title">${pageTitle}</div>
                </div>
                <div class="task-status">${completed || subjectDone ? "✅" : "⬜"}</div>
            `;

            if (!completed && !subjectDone && lane.currentPage < GAME_CONFIG.pagesPerSubject) {
                card.onclick = () => this.startQuiz(subjectKey);
            }

            panel.appendChild(card);
        });
    },

    updateStatusBar() {
        document.getElementById("sunCount").textContent = this.state.sun;
        document.getElementById("dayCount").textContent = this.state.day;
    },

    // ==================== 植物商店交互 ====================
    selectPlant(plantId) {
        const plant = PLANTS[plantId];
        if (this.state.sun < plant.cost) {
            this.showToast("☀️ 阳光不足！", "danger");
            return;
        }
        if (this.selectedPlant === plantId) {
            this.selectedPlant = null;
        } else {
            this.selectedPlant = plantId;
            this.showToast(`选择了 ${plant.name}，点击空地种植`, "success");
        }
        this.renderPlantShop();
    },

    onCellClick(lane, col) {
        if (!this.selectedPlant) return;

        // 检查是否已有植物
        const existing = this.state.plants.find(p => p.lane === lane && p.col === col);
        if (existing) {
            this.showToast("这里已经有植物了！", "warning");
            return;
        }

        const plantConfig = PLANTS[this.selectedPlant];
        if (this.state.sun < plantConfig.cost) {
            this.showToast("☀️ 阳光不足！", "danger");
            return;
        }

        // 种植
        this.state.sun -= plantConfig.cost;
        const newPlant = {
            id: this.state.plantIdCounter++,
            type: this.selectedPlant,
            lane,
            col,
            hp: plantConfig.hp,
            maxHp: plantConfig.hp,
        };
        this.state.plants.push(newPlant);
        this.selectedPlant = null;

        this.saveState();
        this.renderAll();
        this.showToast(`🌱 种下了一棵${plantConfig.name}！`, "success");
    },

    // ==================== 学习/答题系统 ====================
    startQuiz(subjectKey) {
        const subject = CURRICULUM[subjectKey];
        const lane = this.state.lanes.find(l => l.subject === subjectKey);
        const page = subject.pages[lane.currentPage];

        this.currentQuiz = {
            subjectKey,
            page,
            questionIndex: 0,
            correctCount: 0,
            totalQuestions: page.questions.length,
            answered: false,
        };

        document.getElementById("quizTitle").innerHTML = `${subject.icon} ${subject.name} - ${page.title}`;
        document.getElementById("quizModal").classList.remove("hidden");
        this.renderQuestion();
    },

    renderQuestion() {
        const q = this.currentQuiz;
        const question = q.page.questions[q.questionIndex];

        // 进度点
        const progressEl = document.getElementById("quizProgress");
        progressEl.innerHTML = "";
        for (let i = 0; i < q.totalQuestions; i++) {
            const dot = document.createElement("div");
            dot.className = "quiz-dot";
            if (i < q.questionIndex) {
                dot.classList.add("correct");
            } else if (i === q.questionIndex) {
                dot.classList.add("active");
            }
            progressEl.appendChild(dot);
        }

        // 题目
        document.getElementById("quizQuestion").textContent = question.q;

        // 选项
        const optionsEl = document.getElementById("quizOptions");
        optionsEl.innerHTML = "";
        question.options.forEach((option, idx) => {
            const btn = document.createElement("button");
            btn.className = "quiz-option";
            btn.textContent = option;
            btn.onclick = () => this.answerQuestion(idx);
            optionsEl.appendChild(btn);
        });

        // 清除反馈
        document.getElementById("quizFeedback").textContent = "";
        document.getElementById("quizFeedback").className = "quiz-feedback";
        document.getElementById("quizReward").classList.add("hidden");
        document.getElementById("quizNextBtn").classList.add("hidden");
        document.getElementById("quizFinishBtn").classList.add("hidden");

        q.answered = false;
    },

    answerQuestion(selectedIdx) {
        if (this.currentQuiz.answered) return;
        this.currentQuiz.answered = true;

        const q = this.currentQuiz;
        const question = q.page.questions[q.questionIndex];
        const isCorrect = selectedIdx === question.answer;

        // 标记选项
        const options = document.querySelectorAll(".quiz-option");
        options.forEach((opt, idx) => {
            opt.disabled = true;
            if (idx === question.answer) opt.classList.add("correct");
            else if (idx === selectedIdx) opt.classList.add("wrong");
        });

        // 更新进度点
        const dots = document.querySelectorAll(".quiz-dot");
        if (isCorrect) {
            dots[q.questionIndex].classList.remove("active");
            dots[q.questionIndex].classList.add("correct");
            q.correctCount++;
        } else {
            dots[q.questionIndex].classList.remove("active");
            dots[q.questionIndex].classList.add("wrong");
        }

        // 反馈
        const feedback = document.getElementById("quizFeedback");
        if (isCorrect) {
            feedback.textContent = "✅ 答对了！太棒了！";
            feedback.classList.add("correct");
        } else {
            feedback.textContent = "❌ 答错了，再接再厉！";
            feedback.classList.add("wrong");
        }

        // 显示下一题或完成按钮
        if (q.questionIndex < q.totalQuestions - 1) {
            document.getElementById("quizNextBtn").classList.remove("hidden");
        } else {
            document.getElementById("quizFinishBtn").classList.remove("hidden");
        }
    },

    nextQuestion() {
        this.currentQuiz.questionIndex++;
        this.renderQuestion();
    },

    finishQuiz() {
        const q = this.currentQuiz;
        const subjectKey = q.subjectKey;
        const lane = this.state.lanes.find(l => l.subject === subjectKey);
        const subject = CURRICULUM[subjectKey];

        // 计算奖励
        const baseReward = GAME_CONFIG.taskReward;
        const bonusReward = q.correctCount * GAME_CONFIG.correctAnswerBonus;
        const totalReward = baseReward + bonusReward;

        // 显示奖励
        document.getElementById("quizReward").innerHTML = `
            ☀️ +${totalReward} 阳光！<br>
            <span style="font-size:14px;">基础+${baseReward} | 答对奖励+${bonusReward}</span>
        `;
        document.getElementById("quizReward").classList.remove("hidden");
        document.getElementById("quizFinishBtn").classList.add("hidden");

        // 更新状态
        this.state.sun += totalReward;
        this.state.tasksCompleted[subjectKey] = true;
        lane.currentPage++;
        this.state.totalCompletedPages++;

        // 检查科目通关
        if (lane.currentPage >= GAME_CONFIG.pagesPerSubject) {
            this.state.subjectCompleted[subjectKey] = true;
        }

        // 检查解锁
        this.checkUnlocks();
        this.saveState();

        // 关闭弹窗后播放攻击效果和更新界面
        setTimeout(() => {
            document.getElementById("quizModal").classList.add("hidden");
            this.renderAll();

            // 播放攻击效果（弹窗关闭后才能看到）
            if (this.state.subjectCompleted[subjectKey]) {
                this.subjectComplete(subjectKey);
            } else {
                this.zombieTakeDamage(subjectKey, q.correctCount + 2);
            }

            this.showToast(`🎉 完成${subject.name}！获得${totalReward}阳光！`, "success");
        }, 2000);
    },

    // ==================== 僵尸系统 ====================
    zombieTakeDamage(subjectKey, damage) {
        const laneIdx = LANE_SUBJECTS.indexOf(subjectKey);
        const lane = this.state.lanes[laneIdx];
        lane.zombieHP -= damage;

        let killed = false;
        if (lane.zombieHP <= 0) {
            // 僵尸被消灭
            killed = true;
            lane.zombieHP = GAME_CONFIG.zombieBaseHP;
            lane.zombiePosition = 2; // 回到起点(最右边)
            lane.zombieEating = false;
        } else {
            // 僵尸被打退(向右退)
            lane.zombiePosition = Math.max(2, lane.zombiePosition - 5);
        }

        // 先渲染更新后的状态
        this.renderBattlefield();

        // 再播放特效（确保在渲染后的DOM上添加）
        this.showAttackEffect(laneIdx);

        if (killed) {
            this.showToast(`🧟 ${CURRICULUM[subjectKey].name}赛道的僵尸被消灭了！`, "success");
            this.showExplosion(laneIdx);
        }
    },

    showAttackEffect(laneIdx) {
        const cells = document.querySelector(`.lane-cells[data-lane="${laneIdx}"]`);
        if (!cells) return;

        // 找到攻击型植物
        const attackPlants = this.state.plants.filter(p =>
            p.lane === laneIdx &&
            (PLANTS[p.type].ability === "attack" || PLANTS[p.type].ability === "attack_slow")
        );

        attackPlants.forEach(plant => {
            const plantEl = document.getElementById(`plant-${plant.id}`);
            if (!plantEl) return;

            const pea = document.createElement("div");
            pea.className = "pea";
            pea.textContent = PLANTS[plant.type].ability === "attack_slow" ? "❄️" : "🟢";
            pea.style.left = ((plant.col + 1) * (100 / GAME_CONFIG.gridCols)) + "%";
            pea.style.top = "50%";
            pea.style.transform = "translateY(-50%)";
            cells.appendChild(pea);

            setTimeout(() => pea.remove(), 800);
        });

        // 命中特效
        const zombie = document.getElementById(`zombie-${laneIdx}`);
        if (zombie) {
            const hit = document.createElement("div");
            hit.className = "hit-effect";
            hit.textContent = "💥";
            hit.style.right = (this.state.lanes[laneIdx].zombiePosition + 2) + "%";
            hit.style.top = "50%";
            hit.style.transform = "translateY(-50%)";
            cells.appendChild(hit);
            setTimeout(() => hit.remove(), 500);
        }
    },

    showExplosion(laneIdx) {
        const cells = document.querySelector(`.lane-cells[data-lane="${laneIdx}"]`);
        if (!cells) return;

        const boom = document.createElement("div");
        boom.className = "explosion";
        boom.textContent = "💥";
        boom.style.right = "5%";
        boom.style.top = "50%";
        boom.style.transform = "translateY(-50%)";
        cells.appendChild(boom);
        setTimeout(() => boom.remove(), 800);
    },

    showLaserEffect(laneIdx) {
        const cells = document.querySelector(`.lane-cells[data-lane="${laneIdx}"]`);
        if (!cells) return;

        const laser = document.createElement("div");
        laser.className = "laser-beam";
        laser.style.top = "50%";
        laser.style.left = "0";
        laser.style.right = "0";
        cells.appendChild(laser);
        setTimeout(() => laser.remove(), 600);
    },

    // ==================== 科目通关 ====================
    subjectComplete(subjectKey) {
        const laneIdx = LANE_SUBJECTS.indexOf(subjectKey);
        const lane = this.state.lanes[laneIdx];

        // 终极武器：激光消灭僵尸
        this.showLaserEffect(laneIdx);
        lane.zombieHP = 0;
        lane.zombiePosition = 2;
        lane.zombieEating = false;

        // 爆炸特效
        const cells = document.querySelector(`.lane-cells[data-lane="${laneIdx}"]`);
        if (cells) {
            const boom = document.createElement("div");
            boom.className = "explosion";
            boom.textContent = "💥💀💥";
            boom.style.right = "5%";
            boom.style.top = "50%";
            boom.style.transform = "translateY(-50%)";
            cells.appendChild(boom);
            setTimeout(() => boom.remove(), 800);
        }

        this.showToast(`🏆 ${CURRICULUM[subjectKey].name}全部学完！终极武器发射！僵尸消灭！`, "success");

        // 重新渲染（移除被消灭的僵尸）
        setTimeout(() => {
            this.renderBattlefield();
        }, 800);

        // 检查是否全部通关
        const allDone = LANE_SUBJECTS.every(s => this.state.subjectCompleted[s]);
        if (allDone) {
            setTimeout(() => this.gameWin(), 2000);
        }
    },

    // ==================== 解锁系统 ====================
    checkUnlocks() {
        // 按总完成页数解锁（跨科目累计）
        // 也在每科完成特定页数时解锁
        let newUnlocks = [];

        Object.values(PLANTS).forEach(plant => {
            if (!this.state.unlockedPlants.includes(plant.id)) {
                // 检查是否有任一科目达到了解锁页数
                const anySubjectReached = this.state.lanes.some(lane => lane.currentPage >= plant.unlockPages);
                if (anySubjectReached) {
                    this.state.unlockedPlants.push(plant.id);
                    newUnlocks.push(plant);
                }
            }
        });

        newUnlocks.forEach(plant => {
            this.showToast(`🔓 解锁新植物：${plant.emoji} ${plant.name}！`, "success");
        });

        if (newUnlocks.length > 0) {
            this.renderPlantShop();
        }
    },

    // ==================== 天数推进 ====================
    endDay() {
        if (this.state.gameStatus !== "playing") return;

        // 检查是否所有科目都已完成
        const allDone = LANE_SUBJECTS.every(s => this.state.subjectCompleted[s]);
        if (allDone) {
            this.gameWin();
            return;
        }

        // 检查未完成的任务
        let missedSubjects = [];
        LANE_SUBJECTS.forEach(subjectKey => {
            if (!this.state.tasksCompleted[subjectKey] && !this.state.subjectCompleted[subjectKey]) {
                missedSubjects.push(subjectKey);
            }
        });

        let bonusSun = 0;

        if (missedSubjects.length > 0) {
            // 僵尸前进
            missedSubjects.forEach(subjectKey => {
                this.zombieAdvance(subjectKey);
            });
            this.showToast(`⚠️ ${missedSubjects.length}科任务未完成，僵尸前进了！`, "danger");
        } else {
            // 全部完成，计算向日葵阳光
            this.state.plants.forEach(plant => {
                if (plant.type === "sunflower") {
                    bonusSun += 10;
                }
            });
            if (bonusSun > 0) {
                this.state.sun += bonusSun;
            }
            this.showToast("🎉 今天全部完成！太棒了！", "success");
        }

        // 检查游戏结束
        if (this.checkGameOver()) {
            return;
        }

        // 推进到下一天
        this.state.day++;
        this.state.tasksCompleted = { chinese: false, math: false, english: false };

        // 每天僵尸恢复一些HP
        this.state.lanes.forEach(lane => {
            if (!this.state.subjectCompleted[lane.subject]) {
                lane.zombieHP = Math.min(GAME_CONFIG.zombieBaseHP, lane.zombieHP + 3);
            }
        });

        this.saveState();
        this.renderAll();

        // 渲染后播放阳光掉落特效
        if (bonusSun > 0) {
            this.state.plants.forEach(plant => {
                if (plant.type === "sunflower") {
                    this.showSunDrop(plant);
                }
            });
            this.showToast(`🌻 向日葵产生了${bonusSun}点阳光！`, "success");
        }
    },

    zombieAdvance(subjectKey) {
        const laneIdx = LANE_SUBJECTS.indexOf(subjectKey);
        const lane = this.state.lanes[laneIdx];

        // 僵尸前进（right值增大 = 向左移动）
        lane.zombiePosition += 10;

        // 检查是否到达植物位置
        const plantsInLane = this.state.plants.filter(p => p.lane === laneIdx);
        if (plantsInLane.length > 0) {
            // 找到最右边（最靠近僵尸）的植物
            const rightmostPlant = plantsInLane.reduce((a, b) => a.col > b.col ? a : b);
            // 植物中心的right位置
            const cellWidth = 100 / GAME_CONFIG.gridCols;
            const plantRightPos = 100 - (rightmostPlant.col + 0.5) * cellWidth;

            if (lane.zombiePosition >= plantRightPos - cellWidth * 0.4) {
                // 僵尸咬植物
                lane.zombieEating = true;
                rightmostPlant.hp -= GAME_CONFIG.zombieDamagePerMiss;
                this.showToast(`🧟 僵尸咬了你的${PLANTS[rightmostPlant.type].name}！(-${GAME_CONFIG.zombieDamagePerMiss}HP)`, "danger");

                if (rightmostPlant.hp <= 0) {
                    // 植物死亡
                    this.state.plants = this.state.plants.filter(p => p.id !== rightmostPlant.id);
                    this.showToast(`💀 ${PLANTS[rightmostPlant.type].name}被僵尸吃掉了！`, "danger");
                    lane.zombieEating = false;
                }
            }
        }
        // 僵尸到达终点（突破防线）
        if (lane.zombiePosition >= 90) {
            this.showToast(`🧟‍♀️ 僵尸突破了${CURRICULUM[subjectKey].name}赛道防线！`, "danger");
        }
    },

    showSunDrop(plant) {
        const plantEl = document.getElementById(`plant-${plant.id}`);
        if (!plantEl) return;
        const cells = plantEl.closest(".lane-cells");
        if (!cells) return;

        const sun = document.createElement("div");
        sun.className = "sun-drop";
        sun.textContent = "☀️";
        sun.style.left = ((plant.col + 1) * (100 / GAME_CONFIG.gridCols)) + "%";
        sun.style.top = "30%";
        cells.appendChild(sun);
        setTimeout(() => sun.remove(), 1500);
    },

    // ==================== 游戏结束判定 ====================
    checkGameOver() {
        // 游戏结束条件：任意一条未通关赛道的僵尸突破到最左边(position >= 90)
        // 且该赛道没有植物阻挡
        for (let i = 0; i < this.state.lanes.length; i++) {
            const lane = this.state.lanes[i];
            if (this.state.subjectCompleted[lane.subject]) continue;

            const plantsInLane = this.state.plants.filter(p => p.lane === i);
            // 僵尸到达终点且无植物保护
            if (lane.zombiePosition >= 90 && plantsInLane.length === 0) {
                this.gameLose();
                return true;
            }
        }

        // 另一个条件：所有植物都被吃光，且僵尸已深入(position >= 60)
        if (this.state.plants.length === 0) {
            const anyZombieDeep = this.state.lanes.some(l =>
                !this.state.subjectCompleted[l.subject] && l.zombiePosition >= 60
            );
            if (anyZombieDeep) {
                this.gameLose();
                return true;
            }
        }

        return false;
    },

    gameWin() {
        this.state.gameStatus = "won";
        this.clearSave();
        document.getElementById("resultEmoji").textContent = "🏆🌻🌱";
        document.getElementById("resultTitle").textContent = "大获全胜！";
        document.getElementById("resultTitle").className = "result-title win";
        document.getElementById("resultDesc").textContent =
            `太厉害了！你用${this.state.day}天完成了语文、数学、英语全部课程！` +
            `所有僵尸都被消灭了，花园恢复了和平！你是一个真正的学习小勇士！`;
        document.getElementById("gameOverScreen").classList.remove("hidden");
    },

    gameLose() {
        this.state.gameStatus = "lost";
        this.clearSave();
        document.getElementById("resultEmoji").textContent = "🧟💀🧟";
        document.getElementById("resultTitle").textContent = "僵尸吃掉了你的脑子！";
        document.getElementById("resultTitle").className = "result-title lose";
        document.getElementById("resultDesc").textContent =
            `坚持了${this.state.day}天，但僵尸最终吃掉了所有植物。` +
            `不要灰心，再次挑战，坚持每天完成学习任务就能保护花园！`;
        document.getElementById("gameOverScreen").classList.remove("hidden");
    },

    // ==================== Toast 通知 ====================
    showToast(message, type = "") {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    },
};

// 自动加载存档
Game.init();
