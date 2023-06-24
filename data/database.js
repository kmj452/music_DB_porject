const mysql = require('mysql2/promise');//mysql2 패키지 가져옴, 비동기 작업 처리 위해 promise 사용

const pool = mysql.createPool({
    host: 'localhost',
    database: 'blog',
    user: 'root',
    password: '837102'

});   //데이터베이스에 연결

module.exports = pool; // 해당 데이터베이스에 대해 쿼리를 실행하려는 모든 파일로 가져올 수 있음