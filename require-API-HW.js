const express = require('express');
const app = express();
const port = 3000;

// JSON body POST/PUT에서 req.body 쓸때 필요하다고 함. 강의 에서도사용
app.use(express.json());

// 공통 응답 형식
function success(code, data) {
    return {
        status: 'success',
        code: code,
        data: data,
    };
}

function error(message, code) {
    return {
        status: 'error',
        message: message,
        code: code, // HTTP 상태코드랑 맞춰줌
    };
}

// 미들웨어 구현
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`); //요청 발생 시간, http 메서드, 경로
    next();
});


// 메모리 데이터 (DB) 임시 저장용

let users = [];      // { id, name, blocked }
let nextId = 1;
let maintenanceMode = false; // 503 응답코드 보요주기용


// GET 2개


// 기본 GET 요청 라우트 (GET /)
app.get('/', (req, res) => {
    res.status(200).json(success('Welcome to the Home Page'));
});

// GET /users - 전체 사용자 목록 조회 (200)
app.get('/users', (req, res) => {
    res.status(200).json(success(users));
});

// GET /users/:id - 특정 사용자 조회 (200, 404)
app.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id); //같은 사용차 찾기

    if (!user) {
        return res.status(404).json(error('User not found', 404));
    }

    res.status(200).json(success(user));
});


// POST 2개


// POST /users 사용자 생성 (201, 400)
app.post('/users', (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
        // 잘못된 요청 → 400
        return res.status(400).json(error('name 필수입니다.', 400));
    }

    const newUser = {
        id: nextId++,
        name,
        blocked: false,
    };

    users.push(newUser);

    res.status(201).json(success(newUser));
});

// POST /users/:id/block 사용자 차단 (200, 404)
app.post('/users/:id/block', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
        return res.status(404).json(error('User not found', 404));
    }

    user.blocked = true;
    res.status(200).json(success({ message: 'User blocked', user }));
});


// PUT 2개


// PUT /users/:id 사용자 이름 수정 (200, 400, 404, 500)
app.put('/users/:id', (req, res, next) => {
    const id = Number(req.params.id);
    const { name } = req.body;

    const user = users.find((u) => u.id === id);
    if (!user) {
        return res.status(404).json(error('User not found', 404));
    }

    if (!name || typeof name !== 'string') {
        return res.status(400).json(error('name 필수입니다.', 400));
    }

    // 이름이 "error"이면 일부러 서버 에러 발생 (500)
    if (name === 'error') {
        const err = new Error('테스트용 서버 에러');
        return next(err); // 아래 에러로 이동
    }

    user.name = name;
    res.status(200).json(success(user));
});

// PUT /maintenance - 유지보수 모드 토글 (200)
app.put('/maintenance', (req, res) => {
    maintenanceMode = !maintenanceMode;
    res.json(
        success({
            maintenanceMode,
            message: maintenanceMode
                ? '유지보수 모드 활성화됨'
                : '유지보수 모드 비활성화됨',
        })
    );
});


// A,B. DELETE 2개 이상


// DELETE /users/:id 사용자 한 명 삭제 (204, 404)
app.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
        return res.status(404).json(error('User not found', 404));
    }

    users.splice(index, 1);

    // 204 body 없이 응답
    res.status(204).send();
});

// DELETE /users - 전체 사용자 삭제 (204, 503)
app.delete('/users', (req, res) => {
    if (maintenanceMode) {
        // 유지보수 중이면 503
        return res
            .status(503)
            .json(error('유지보수 모드 전체 삭제 불가', 503));
    }

    users = [];
    res.status(204).send();
});


// 404 처리, 정의 안 된 라우트

app.use((req, res) => {
    res.status(404).json(error('Route not found', 404));
});


// 에러 처리 미들웨어, 500

app.use((err, req, res, next) => {
    console.error('서버 에러 발생:', err);
    res
        .status(500)
        .json(error('서버 내부 오류가 발생했습니다.', 500));
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});