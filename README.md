require-API-HW.js
=====================

주요기능
=================
* 사용자(User) 데이터 CRUD
* 차단 기능 (POST /users/:id/block)
* 	유지보수 모드(maintenance mode) ON/OFF
* 	공통 응답 포맷 (success/error)
* 	2xx / 4xx / 5xx 상태 코드 활용
* 	요청 로그 미들웨어
* 	404 처리, 500 에러 처리
* 	메모리 기반 데이터 저장(데이터베이스 없음)

1.미들웨어
-------------
*    JSON 파서 미들웨어
        * POST, PUT 요청에서 req.body를 사용하기 위해 필요
<pre>
<code>
app.use(express.json());
</code>
</pre>
*    요청 로그 미들웨어
     *    요청 시간, HTTP 메서드, URL을 콘솔에 출력
<pre>
<code>
app.use((req, res, next) => {
    console.log(`[시간] 메서드 경로`);
    next();
});
</code>
</pre>
*    404 처리 미들웨어
     *   정의되지 않은 라우트 요청 처리.

* 500 에러 처리 미들웨어
  * Express 표준 에러 핸들링 구조로 서버 에러 응답.

2.공통응답 형식
--------------
*    성공 응답 예시
<pre>
<code>
{
  "status": "success",
  "code": 200,
  "data": { ... }
}
</code>
</pre>
*   실패 응답 예시
<pre>
<code>
{
  "status": "error",
  "message": "에러 메시지",
  "code": 404
}
</code>
</pre>

3.데이터 관리
-------------
*    데이터베이스 없이 메모리 배열을 사용합니다.
<pre>
<code>
let users = [];      
let nextId = 1;
let maintenanceMode = false;
</code>
</pre>

API 설명
===========
1.GET

* GET
  1. 홈화면
     * 200 OK
     * 공통 응답 형식 적용


* GET/users
    1. 전체 사용자 목록 조회
        * 200 OK


* GET/users/:id
    1. 특정 사용자 조회
        * 200 OK
        * 404 Not Found (없는 경우)

2.POST

* POST/users
  1. 사용자 생성
     * 요정 바디 : { "name": "이름" }
     * 201 Created
     * 400 Bad Request (name 누락 시)


* POST/users/:id/block
    1. 사용자 차단
       * 200 OK
       * 404 Not Found

3.PUT

* PUT/users/:id
  1. 사용자 정보 수정
     * 200 OK
     * 400 Bad Request
     * 404 Not Found
     * 500 Internal Server Error (name === “error” 로 일부러 발생시킴)


* PUT/maintenance
    1. 유지보수 모드 온/오프
        * 200 OK

4.DELETE

* DELETE/users/:id
    1. 특정 사용자 삭제 
        * 204 No Content
        * 404 Not Found

    
* DELETE/users/
    1. 전체 사용자 삭제
        * 204 No Content
        * 503 유지보수 모드 삭제 불가
