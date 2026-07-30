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
            mode: 'online',  // 'online' 或 'offline'
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

        // 恢复模式选择器 UI
        this.updateModeUI();

        this.renderAll();
        this.checkUnlocks();
        this.showToast("🌱 欢迎来到花园！先种一棵向日葵吧！", "success");
    },

    restart() {
        this.clearSave();
        this.start();
    },

    // ==================== 模式管理 ====================
    setMode(mode) {
        this.state.mode = mode;
        this.saveState();

        // 更新开始画面选择器
        document.getElementById('modeOnline').classList.toggle('active', mode === 'online');
        document.getElementById('modeOffline').classList.toggle('active', mode === 'offline');

        // 更新状态栏指示器
        const icon = mode === 'online' ? '📱' : '📝';
        const text = mode === 'online' ? '在线' : '线下';
        document.getElementById('modeIndicatorIcon').textContent = icon;
        document.getElementById('modeIndicatorText').textContent = text;

        // 更新任务面板（显示模式标识）
        this.renderTaskPanel();

        this.showToast(mode === 'online' ? '📱 已切换到在线答题模式' : '📝 已切换到线下书写模式', 'success');
    },

    toggleMode() {
        this.setMode(this.state.mode === 'online' ? 'offline' : 'online');
    },

    updateModeUI() {
        const mode = this.state.mode;
        document.getElementById('modeOnline').classList.toggle('active', mode === 'online');
        document.getElementById('modeOffline').classList.toggle('active', mode === 'offline');
        document.getElementById('modeIndicatorIcon').textContent = mode === 'online' ? '📱' : '📝';
        document.getElementById('modeIndicatorText').textContent = mode === 'online' ? '在线' : '线下';
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

        if (this.state.mode === 'online') {
            // 原有在线模式流程不变
            document.getElementById("quizTitle").innerHTML = `${subject.icon} ${subject.name} - ${page.title}`;
            document.getElementById("quizModal").classList.remove("hidden");
            this.renderQuestion();
        } else {
            // 离线书写模式
            this.startOfflineQuiz(subjectKey);
        }
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

    // ==================== 离线书写模式（OCR 自动识别） ====================

    // 阶段1：展示题目和选项，让孩子自己判断正确答案并书写
    startOfflineQuiz(subjectKey) {
        const subject = CURRICULUM[subjectKey];
        const lane = this.state.lanes.find(l => l.subject === subjectKey);
        const page = subject.pages[lane.currentPage];

        document.getElementById('offlineTitle').innerHTML = `${subject.icon} ${subject.name} - ${page.title}`;

        // 生成正确答案示例（一行，仅作为书写格式参考）
        const correctAnswers = page.questions.map(q => q.options[q.answer]);
        document.getElementById('offlineFormatExample').innerHTML = correctAnswers.join(' &nbsp;&nbsp; ');

        // 生成题目列表（显示题号、题目文字、A/B/C/D 选项，但不揭示正确答案）
        const questionsEl = document.getElementById('offlineQuestions');
        questionsEl.innerHTML = '';

        page.questions.forEach((q, idx) => {
            const item = document.createElement('div');
            item.className = 'offline-question-item';

            const optionsHtml = q.options.map((opt, oIdx) => {
                const label = String.fromCharCode(65 + oIdx);
                return `<span class="offline-option"><b>${label}.</b> ${opt}</span>`;
            }).join('');

            item.innerHTML = `
                <div class="offline-question-num">${idx + 1}</div>
                <div class="offline-question-text">
                    <div class="offline-question-stem">${q.q}</div>
                    <div class="offline-options-list">${optionsHtml}</div>
                </div>
            `;
            questionsEl.appendChild(item);
        });

        // 重置所有阶段，显示阶段1
        document.getElementById('offlinePhase1').classList.remove('hidden');
        document.getElementById('offlinePhase2').classList.add('hidden');
        document.getElementById('offlinePhase3').classList.add('hidden');

        document.getElementById('offlineModal').classList.remove('hidden');

        // 每次重新进入 phase1 时，恢复手动核对按钮的显示状态
        const manualBtn = document.getElementById('manualVerifyBtn');
        if (manualBtn) manualBtn.classList.remove('hidden');
    },

    // 阶段2：打开相机
    async openCamera() {
        document.getElementById('offlinePhase1').classList.add('hidden');
        document.getElementById('offlinePhase3').classList.add('hidden');
        document.getElementById('offlinePhase2').classList.remove('hidden');

        const video = document.getElementById('cameraVideo');

        try {
            // 优先使用后置摄像头（facingMode: environment）
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            video.srcObject = stream;
            this._cameraStream = stream;

            video.classList.remove('hidden');
            document.getElementById('cameraCanvas').classList.add('hidden');
            document.getElementById('captureBtn').classList.remove('hidden');
        } catch (err) {
            console.error('相机访问失败:', err);

            // 处理不同错误类型
            if (err.name === 'NotAllowedError') {
                this.showToast('⚠️ 相机权限被拒绝，请在设置中允许相机访问', 'warning');
            } else if (err.name === 'NotFoundError') {
                this.showToast('⚠️ 未找到摄像头设备', 'danger');
            } else if (err.name === 'NotReadableError') {
                this.showToast('⚠️ 摄像头被其他应用占用', 'warning');
            } else {
                this.showToast('⚠️ 无法打开相机: ' + err.message, 'danger');
            }

            // 回退到阶段1，允许重新尝试或使用相册
            document.getElementById('offlinePhase2').classList.add('hidden');
            document.getElementById('offlinePhase1').classList.remove('hidden');
        }
    },

    // 拍照截取
    async capturePhoto() {
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('cameraCanvas');

        if (!video.srcObject) {
            this.showToast('⚠️ 相机未就绪', 'warning');
            return;
        }

        // 截取视频帧到 canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 保存照片数据
        const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        this._capturedPhotoDataURL = await this.preprocessImage(rawDataUrl);

        // 播放闪光效果
        const flash = document.createElement('div');
        flash.className = 'camera-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);

        // 关闭相机流
        this.stopCamera();

        // 进入核对阶段
        this.showVerifyPhase();
    },

    // 重拍（回到相机预览）
    retakePhoto() {
        // 让正在运行的旧 OCR session 失效（让上一次 OCR 即使完成也不写结果）
        this._ocrSessionId = (this._ocrSessionId || 0) + 1;

        // 终止正在运行的 OCR worker
        if (this._tesseractWorker) {
            this._tesseractWorker.terminate();
            this._tesseractWorker = null;
        }
        // 清除已拍照片和识别结果
        this._capturedPhotoDataURL = null;
        this._verifyResults = null;
        this._recognizedText = '';
        this._ocrConfidence = 0;

        // 清空识别结果区域，防止显示旧数据
        document.getElementById('verifyQuestions').innerHTML = '';
        document.getElementById('ocrStatus').classList.add('hidden');

        // 重置操作按钮
        document.getElementById('verifyAllCorrectBtn').classList.add('hidden');
        document.getElementById('verifyHasWrongBtn').classList.add('hidden');
        document.getElementById('manualVerifyBtn').classList.add('hidden');

        // 重新打开相机
        this.openCamera();
    },

    // 停止相机流
    stopCamera() {
        if (this._cameraStream) {
            this._cameraStream.getTracks().forEach(track => track.stop());
            this._cameraStream = null;
        }
    },

    // 图像预处理：放大+温和灰度增强，保留笔画细节
    // 关键改进：手写文字通常较小，必须放大；二值化会丢失笔画粗细，改为保留灰度
    preprocessImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');

                // 第一步：放大到适合 OCR 的尺寸（手写文字小，必须放大才能识别）
                // Tesseract 对 300DPI 以上的文字识别率最佳，目标边长 2400+
                const targetSize = 2400;
                let w = img.width;
                let h = img.height;

                // 计算放大比例（保证长边达到 targetSize）
                const longSide = Math.max(w, h);
                const scale = longSide < targetSize ? targetSize / longSide : 1;
                w = Math.round(w * scale);
                h = Math.round(h * scale);

                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');

                // 先用高质量缩放绘制原图（启用平滑）
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, w, h);

                try {
                    const imgData = ctx.getImageData(0, 0, w, h);
                    const data = imgData.data;

                    // 第二步：转灰度 + 温和对比度增强（不做过激二值化）
                    // 二值化对儿童手写伤害大：笔画粗细不一，浅色笔迹会被误杀
                    for (let i = 0; i < data.length; i += 4) {
                        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                        // 温和对比度增强（1.2 倍而非 1.5 倍）
                        let enhanced = (gray - 128) * 1.2 + 128;
                        enhanced = Math.max(0, Math.min(255, enhanced));
                        data[i] = data[i + 1] = data[i + 2] = enhanced;
                    }

                    // 第三步：白平衡（让纸面更白，笔迹更黑）
                    // 找最亮 1% 的像素作为白点参考
                    const histogram = new Array(256).fill(0);
                    for (let i = 0; i < data.length; i += 4) {
                        histogram[data[i]]++;
                    }
                    const totalPixels = data.length / 4;
                    let whiteThreshold = 255;
                    let cumulative = 0;
                    for (let v = 255; v >= 0; v--) {
                        cumulative += histogram[v];
                        if (cumulative >= totalPixels * 0.005) {
                            whiteThreshold = v;
                            break;
                        }
                    }
                    // 用最亮像素作为新的"白"，重新映射
                    if (whiteThreshold < 250) {
                        const ratio = 255 / Math.max(1, whiteThreshold);
                        for (let i = 0; i < data.length; i += 4) {
                            const newVal = Math.min(255, data[i] * ratio);
                            data[i] = data[i + 1] = data[i + 2] = newVal;
                        }
                    }

                    ctx.putImageData(imgData, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.92));
                } catch (e) {
                    // 预处理失败时返回放大后的原图
                    console.warn('图像预处理失败，使用原图:', e);
                    resolve(canvas.toDataURL('image/jpeg', 0.92));
                }
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    },

    // 降级方法：从相册/文件选择照片
    selectPhotoFromAlbum() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const rawDataUrl = ev.target.result;
                this._capturedPhotoDataURL = await this.preprocessImage(rawDataUrl);
                // 隐藏阶段1，直接进入核对阶段
                document.getElementById('offlinePhase1').classList.add('hidden');
                this.showVerifyPhase();
            };
            reader.readAsDataURL(file);
        };
        input.click();
    },

    // 阶段3：自动识别核对
    showVerifyPhase() {
        document.getElementById('offlinePhase2').classList.add('hidden');
        document.getElementById('offlinePhase3').classList.remove('hidden');

        // 显示照片
        const photoImg = document.getElementById('verifyPhotoImg');
        const placeholder = document.getElementById('photoPlaceholder');

        if (this._capturedPhotoDataURL) {
            photoImg.src = this._capturedPhotoDataURL;
            photoImg.classList.remove('hidden');
            placeholder.classList.add('hidden');
        } else {
            photoImg.classList.add('hidden');
            placeholder.textContent = '未拍摄照片';
            placeholder.classList.remove('hidden');
        }

        // 清空之前的结果，显示加载状态
        const verifyQuestionsEl = document.getElementById('verifyQuestions');
        verifyQuestionsEl.innerHTML = '';
        document.getElementById('ocrStatus').classList.remove('hidden');
        document.getElementById('verifyAllCorrectBtn').classList.add('hidden');
        document.getElementById('verifyHasWrongBtn').classList.add('hidden');
        document.getElementById('verifyInstructionText').textContent = '系统正在识别照片中的答案，请稍候...';

        // 开始 OCR 识别
        this.startOCR();
    },

    // 启动 Tesseract.js 进行 OCR 识别
    // 关键改进：使用 PSM 6（单文本块）和 PSM 11（稀疏文本）两种模式分别识别，取文字更多的结果
    async startOCR() {
        const statusText = document.getElementById('ocrStatusText');

        // 先终止可能还在运行的上一个 worker（防止重拍后旧识别结果残留）
        if (this._tesseractWorker) {
            try { await this._tesseractWorker.terminate(); } catch (e) { /* ignore */ }
            this._tesseractWorker = null;
        }

        // 用版本号标记本次 OCR，重拍/取消时会自增，旧结果会失效
        this._ocrSessionId = (this._ocrSessionId || 0) + 1;
        const mySessionId = this._ocrSessionId;

        // 检查 Tesseract.js 是否加载成功
        if (typeof Tesseract === 'undefined') {
            statusText.textContent = '识别引擎加载失败，请刷新页面重试';
            this.showToast('⚠️ 识别引擎未加载，请检查网络', 'danger');
            return;
        }

        statusText.textContent = '正在加载识别引擎（首次使用需要下载数据，请稍候）...';

        try {
            const worker = await Tesseract.createWorker('chi_sim+eng', 1, {
                logger: (m) => {
                    // 只更新当前 session 的状态（避免旧 OCR 的进度污染新一次）
                    if (this._ocrSessionId !== mySessionId) return;
                    if (m.status === 'recognizing text') {
                        statusText.textContent = `正在识别照片中... ${Math.round(m.progress * 100)}%`;
                    } else if (m.status === 'loading language traineddata') {
                        statusText.textContent = `正在加载语言数据... ${Math.round(m.progress * 100)}%`;
                    } else {
                        statusText.textContent = m.status;
                    }
                }
            });
            this._tesseractWorker = worker;

            // 检查 session 是否已被新一次 OCR 取代
            if (this._ocrSessionId !== mySessionId) {
                await worker.terminate();
                return;
            }

            // ========== 多次 OCR 取最佳结果 ==========
            // PSM 6: 假设为单一统一的文本块（适合一行答案）
            // PSM 11: 稀疏文本，不做特定排序（适合分散的手写文字）
            const psmModes = [
                { mode: '6', label: 'PSM 6' },
                { mode: '11', label: 'PSM 11' }
            ];

            let bestResult = null;
            let bestLength = 0;
            let bestPsmLabel = '';
            let bestConfidence = 0;

            for (const psm of psmModes) {
                if (this._ocrSessionId !== mySessionId) break; // session 已失效
                try {
                    await worker.setParameters({
                        tessedit_pageseg_mode: psm.mode,
                        preserve_interword_spaces: '1'
                    });

                    statusText.textContent = `正在识别（${psm.label}）...`;
                    const result = await worker.recognize(this._capturedPhotoDataURL);
                    const text = (result.data.text || '').trim();
                    const words = result.data.words || [];
                    const confs = words.map(w => w.confidence || 0).filter(c => c > 0);
                    const avgConf = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0;

                    // 优先选识别文字更多的结果；如果文字长度相当，选置信度更高的
                    if (text.length > bestLength || (text.length === bestLength && avgConf > bestConfidence)) {
                        bestResult = text;
                        bestLength = text.length;
                        bestPsmLabel = psm.label;
                        bestConfidence = avgConf;
                    }
                } catch (e) {
                    console.warn(`${psm.label} 识别失败:`, e);
                }
            }

            // 最后再检查一次：session 是否还有效
            if (this._ocrSessionId !== mySessionId) {
                await worker.terminate();
                return;
            }

            await worker.terminate();
            if (this._tesseractWorker === worker) this._tesseractWorker = null;

            this._recognizedText = bestResult || '';
            this._ocrConfidence = Math.round(bestConfidence);

            console.log(`OCR 最佳结果 [${bestPsmLabel}], 文字长度=${bestLength}, 置信度=${this._ocrConfidence}%, 内容:`, this._recognizedText);

            this.processOCRResult(this._recognizedText);
        } catch (err) {
            // session 已失效时静默退出
            if (this._ocrSessionId !== mySessionId) return;
            console.error('OCR识别失败:', err);
            statusText.textContent = '识别失败，请重试或改用手动核对';
            this.showToast('⚠️ 自动识别失败：' + err.message, 'danger');

            // OCR 失败时，自动切换到手动核对
            setTimeout(() => {
                if (this._ocrSessionId === mySessionId) this.switchToManualVerify();
            }, 800);
        }
    },

    // 常见 OCR 误识别映射（手写 / 印刷体混淆）
    getOCRConfusions() {
        return {
            'a': ['a', 'o', 'e', 'd', 'q'],
            'o': ['o', 'a', 'e', 'c', '0'],
            'e': ['e', 'c', 'o', 'a'],
            'i': ['i', 'l', 'j', '1'],
            'u': ['u', 'v', 'n'],
            'b': ['b', '6', '8'],
            'p': ['p', 'q', '9'],
            '啊': ['啊', '阿', '女', '口', '哪', '那'],
            '哦': ['哦', '我', '饿', '鹅', '俄', '蛾'],
            '鹅': ['鹅', '饿', '哦', '我', '俄', '蛾'],
            '饿': ['饿', '鹅', '哦', '我', '俄'],
            '我': ['我', '哦', '饿', '鹅'],
            '一': ['一', '二', '三', '—', '-', '1'],
            '二': ['二', '一', '三'],
            '三': ['三', '二', '一'],
            '大': ['大', '太', '犬', '天'],
            '小': ['小', '少', '水'],
            '人': ['人', '入', '八'],
            '口': ['口', '日', '曰', '中'],
            '日': ['日', '曰', '口', '白'],
            '目': ['目', '日', '月'],
            '木': ['木', '本', '术'],
            '本': ['本', '木', '术'],
            '王': ['王', '玉', '主'],
            '土': ['土', '士', '干'],
            '上': ['上', '下', '土'],
            '下': ['下', '上', '不'],
            '天': ['天', '夫', '大', '太']
        };
    },

    // 处理 OCR 结果：清理文本并按顺序匹配每道题的正确答案（支持模糊匹配）
    processOCRResult(rawText) {
        const recognized = this.cleanOCRText(rawText);
        const questions = this.currentQuiz.page.questions;
        const results = [];

        // 复制一份用于逐步匹配
        let remainingText = recognized;

        questions.forEach((q) => {
            const answer = this.cleanOCRText(q.options[q.answer]);
            const match = this.findAndRemoveAnswer(remainingText, answer);
            results.push(match.found);
            remainingText = match.remaining;
        });

        this._verifyResults = results;
        this.renderOCRResults(rawText, results);
    },

    // 清理 OCR 文本：去除空格、标点，统一小写
    cleanOCRText(text) {
        if (!text) return '';
        return text
            .replace(/\s+/g, '')                       // 去除所有空白
            .replace(/[，。、；：？！.,;:!?\-_\|\/\\]/g, '') // 去除常见标点
            .toLowerCase();                            // 英文统一小写
    },

    // 在文本中查找答案并移除，支持模糊匹配
    findAndRemoveAnswer(text, answer) {
        // 1. 优先精确匹配
        let idx = text.indexOf(answer);
        if (idx !== -1) {
            return {
                found: true,
                remaining: text.slice(0, idx) + text.slice(idx + answer.length)
            };
        }

        // 2. 模糊匹配：利用常见 OCR 混淆字符表
        const confusions = this.getOCRConfusions()[answer] || [answer];
        // 优先匹配整个答案串，再逐个字符匹配
        for (let i = 0; i <= text.length - answer.length; i++) {
            const slice = text.slice(i, i + answer.length);
            let allMatch = true;
            for (let j = 0; j < answer.length; j++) {
                const answerChar = answer[j];
                const textChar = slice[j];
                const charConfusions = this.getOCRConfusions()[answerChar] || [answerChar];
                if (!charConfusions.includes(textChar)) {
                    allMatch = false;
                    break;
                }
            }
            if (allMatch) {
                return {
                    found: true,
                    remaining: text.slice(0, i) + text.slice(i + answer.length)
                };
            }
        }

        // 3. 单字符答案：在剩余文本中任找其一
        if (answer.length === 1) {
            for (let i = 0; i < text.length; i++) {
                if (confusions.includes(text[i])) {
                    return {
                        found: true,
                        remaining: text.slice(0, i) + text.slice(i + 1)
                    };
                }
            }
        }

        return { found: false, remaining: text };
    },

    // 渲染 OCR 识别结果和每题判断
    renderOCRResults(rawText, results) {
        const questions = this.currentQuiz.page.questions;
        const container = document.getElementById('verifyQuestions');
        container.innerHTML = '';

        let correctCount = 0;
        const unrecognizedCount = results.filter(r => !r).length;

        questions.forEach((q, idx) => {
            const isCorrect = results[idx];
            if (isCorrect) correctCount++;

            const answerText = q.options[q.answer];
            const row = document.createElement('div');
            row.className = `verify-question-row ${isCorrect ? 'correct' : 'wrong'}`;
            row.innerHTML = `
                <div class="verify-q-num">${idx + 1}</div>
                <div class="verify-q-content">
                    <div class="verify-q-text">${q.q}</div>
                    <div class="verify-q-answer">正确答案：<b>${answerText}</b></div>
                    <div class="verify-q-result ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? '✅ 识别正确' : '❌ 未识别到'}</div>
                </div>
            `;
            container.appendChild(row);
        });

        // 显示原始识别文本（可折叠）
        const rawTextEl = document.createElement('div');
        rawTextEl.className = 'ocr-raw-text';
        rawTextEl.innerHTML = `
            <div class="ocr-raw-label">📝 系统识别到的内容：</div>
            <div class="ocr-raw-content">${this.escapeHtml(rawText || '（未识别到任何文字）')}</div>
            <div class="ocr-raw-tip">如果识别结果和实际写的不符，建议写工整后重拍，或点击下方"手动核对"逐题确认</div>
        `;
        container.appendChild(rawTextEl);

        // 更新状态提示
        document.getElementById('ocrStatus').classList.add('hidden');
        const confidence = this._ocrConfidence || 0;
        const allUnrecognized = unrecognizedCount === results.length;
        const lowConfidence = confidence < 50;

        let hintHtml = '';
        if (allUnrecognized) {
            hintHtml = '<br><span style="color:#D32F2F;font-size:13px; font-weight:bold;">⚠️ 完全未识别到手写内容，请点击"手动核对"逐题确认</span>';
        } else if (unrecognizedCount > 0 || lowConfidence) {
            hintHtml = `<br><span style="color:#E65100;font-size:13px;">⚠️ ${unrecognizedCount}题未识别/置信度${confidence}%较低，建议手动核对确认</span>`;
        }
        document.getElementById('verifyInstructionText').innerHTML =
            `识别完成！共 <b>${results.length}</b> 题，自动识别对 <b>${correctCount}</b> 题${hintHtml}`;

        // 显示操作按钮
        const allCorrect = results.every(r => r === true);
        const manualBtn = document.getElementById('manualVerifyBtn');
        if (allCorrect) {
            document.getElementById('verifyAllCorrectBtn').classList.remove('hidden');
            document.getElementById('verifyHasWrongBtn').classList.add('hidden');
            manualBtn.classList.add('hidden');
        } else {
            document.getElementById('verifyAllCorrectBtn').classList.add('hidden');
            document.getElementById('verifyHasWrongBtn').classList.remove('hidden');
            // 始终显示手动核对按钮，确保 OCR 失败时用户有兜底
            manualBtn.classList.remove('hidden');
        }
    },

    // HTML 转义，防止识别文本中的特殊字符破坏页面
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // 放大查看照片
    zoomPhoto() {
        if (!this._capturedPhotoDataURL) return;
        const overlay = document.createElement('div');
        overlay.className = 'photo-zoom-overlay';
        overlay.innerHTML = `<img src="${this._capturedPhotoDataURL}" alt="放大查看"><div class="photo-zoom-hint">👆 点击任意处关闭</div>`;
        overlay.onclick = () => overlay.remove();
        document.body.appendChild(overlay);
    },

    // 全部正确 → 发放奖励
    verifyAllCorrect() {
        this.currentQuiz.correctCount = this.currentQuiz.totalQuestions;
        this.finishOfflineQuiz(true);
    },

    // 有错误 → 不奖励，可重试
    verifyHasWrong() {
        const wrongCount = this._verifyResults.filter(r => r === false).length;
        this.showToast(`❌ 有${wrongCount}道题没识别到或写错了，请在本子上改正后重新拍照核对`, 'danger');
        this.finishOfflineQuiz(false);
    },

    // 切换到手动核对（OCR 不准时的兜底方案）
    switchToManualVerify() {
        this._verifyResults = new Array(this.currentQuiz.totalQuestions).fill(null);
        this.renderManualVerify();
    },

    // 渲染手动核对界面
    renderManualVerify() {
        const questions = this.currentQuiz.page.questions;
        const container = document.getElementById('verifyQuestions');
        container.innerHTML = '';

        // 更新顶部提示
        document.getElementById('verifyInstructionText').innerHTML =
            '👆 请对照照片，逐题点击孩子写的答案';
        document.getElementById('ocrStatus').classList.add('hidden');

        questions.forEach((q, idx) => {
            const row = document.createElement('div');
            row.className = 'verify-question-row';
            row.dataset.questionIndex = idx;

            const optionsHtml = q.options.map((opt, oIdx) => {
                const label = String.fromCharCode(65 + oIdx);
                return `<button class="verify-option-btn" data-qidx="${idx}" data-oidx="${oIdx}" onclick="Game.selectManualAnswer(${idx}, ${oIdx})">${label}. ${opt}</button>`;
            }).join('');

            row.innerHTML = `
                <div class="verify-q-num">${idx + 1}</div>
                <div class="verify-q-content">
                    <div class="verify-q-text">${q.q}</div>
                    <div class="verify-q-options">${optionsHtml}</div>
                    <div class="verify-q-result hidden"></div>
                </div>
            `;
            container.appendChild(row);
        });

        // 隐藏自动识别的操作按钮，等待家长逐题点选
        document.getElementById('verifyAllCorrectBtn').classList.add('hidden');
        document.getElementById('verifyHasWrongBtn').classList.add('hidden');
        document.getElementById('manualVerifyBtn').classList.add('hidden');
    },

    // 家长手动点选孩子写的答案
    selectManualAnswer(questionIdx, selectedOptionIdx) {
        const q = this.currentQuiz.page.questions[questionIdx];
        const isCorrect = selectedOptionIdx === q.answer;
        this._verifyResults[questionIdx] = isCorrect;

        const row = document.querySelector(`.verify-question-row[data-question-index="${questionIdx}"]`);
        const buttons = row.querySelectorAll('.verify-option-btn');
        const resultEl = row.querySelector('.verify-q-result');

        buttons.forEach(btn => btn.classList.remove('selected', 'correct-answer', 'wrong-answer'));
        buttons[selectedOptionIdx].classList.add('selected');

        if (isCorrect) {
            buttons[selectedOptionIdx].classList.add('correct-answer');
            resultEl.textContent = '✅ 正确！';
            resultEl.className = 'verify-q-result correct';
        } else {
            buttons[selectedOptionIdx].classList.add('wrong-answer');
            buttons[q.answer].classList.add('correct-answer');
            resultEl.innerHTML = `❌ 错误！正确答案：${String.fromCharCode(65 + q.answer)}`;
            resultEl.className = 'verify-q-result wrong';
        }
        resultEl.classList.remove('hidden');

        const allAnswered = this._verifyResults.every(r => r !== null);
        if (allAnswered) {
            const allCorrect = this._verifyResults.every(r => r === true);
            if (allCorrect) {
                document.getElementById('verifyAllCorrectBtn').classList.remove('hidden');
                document.getElementById('verifyHasWrongBtn').classList.add('hidden');
            } else {
                document.getElementById('verifyAllCorrectBtn').classList.add('hidden');
                document.getElementById('verifyHasWrongBtn').classList.remove('hidden');
            }
            document.getElementById('manualVerifyBtn').classList.add('hidden');
        }
    },

    // 完成离线测验
    finishOfflineQuiz(success) {
        if (success) {
            // 与在线模式 finishQuiz() 使用相同的奖励逻辑
            const q = this.currentQuiz;
            const subjectKey = q.subjectKey;
            const lane = this.state.lanes.find(l => l.subject === subjectKey);
            const subject = CURRICULUM[subjectKey];

            // 离线模式下，全部正确才给奖励
            const baseReward = GAME_CONFIG.taskReward;
            const bonusReward = q.correctCount * GAME_CONFIG.correctAnswerBonus;
            const totalReward = baseReward + bonusReward;

            this.state.sun += totalReward;
            this.state.tasksCompleted[subjectKey] = true;
            lane.currentPage++;
            this.state.totalCompletedPages++;

            // 检查科目通关
            if (lane.currentPage >= GAME_CONFIG.pagesPerSubject) {
                this.state.subjectCompleted[subjectKey] = true;
            }

            this.checkUnlocks();
            this.saveState();

            // 关闭弹窗
            document.getElementById('offlineModal').classList.add('hidden');

            // 播放攻击效果（与在线模式一致）
            setTimeout(() => {
                this.renderAll();
                if (this.state.subjectCompleted[subjectKey]) {
                    this.subjectComplete(subjectKey);
                } else {
                    this.zombieTakeDamage(subjectKey, q.correctCount + 2);
                }
                this.showToast(`🎉 完成${subject.name}！获得${totalReward}阳光！`, 'success');
            }, 300);
        } else {
            // 失败：关闭核对弹窗，回到阶段1重新做题
            document.getElementById('offlinePhase3').classList.add('hidden');
            document.getElementById('offlineModal').classList.add('hidden');

            // 让任何旧 OCR 失效
            this._ocrSessionId = (this._ocrSessionId || 0) + 1;
            if (this._tesseractWorker) {
                this._tesseractWorker.terminate();
                this._tesseractWorker = null;
            }

            // 清除照片数据
            this._capturedPhotoDataURL = null;
            this._verifyResults = null;
            this._recognizedText = '';
            this._ocrConfidence = 0;

            // 重新打开离线测验（同一科目同一页）
            setTimeout(() => {
                this.startOfflineQuiz(this.currentQuiz.subjectKey);
            }, 200);
        }
    },

    // 取消离线测验
    cancelOffline() {
        this.stopCamera();
        // 让任何运行中的旧 OCR session 失效
        this._ocrSessionId = (this._ocrSessionId || 0) + 1;
        if (this._tesseractWorker) {
            this._tesseractWorker.terminate();
            this._tesseractWorker = null;
        }
        this._capturedPhotoDataURL = null;
        this._verifyResults = null;
        this._recognizedText = '';
        this._ocrConfidence = 0;
        this.currentQuiz = null;
        document.getElementById('offlineModal').classList.add('hidden');
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

// 页面关闭时清理相机流
window.addEventListener('beforeunload', () => {
    Game.stopCamera();
});
