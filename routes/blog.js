const express = require('express');

const db = require('../data/database');//pool 객체 사용가능

const router = express.Router(); //라우터 객체를 사용해 클라이언트에서 요청한 요청 경로에 따라 실행될 함수 등록

router.get('/', function(req,res) {
    res.render('user-login');
    //res.redirect('/posts'); // '/' 에 방문하면 /posts로 가게 됨(둘중 어디로 가도 한곳으로 보냄)
});

router.get('/posts', async function(req,res) {
    const [posts] = await db.query('SELECT posts.*, authors.name AS author_name FROM posts INNER JOIN authors ON posts.author_id = authors.id');
    res.render('posts-list', {posts: posts}); // 이 파일의 내용을 렌더링해서 내보냄? // posts 키는 우리가 비구조화로 생성한 게시물 배열을 참조
});

router.get('/new-post', async function(req,res){ //async = 비동기?
    const [authors] = await db.query('SELECT * FROM authors'); //[result ]=  배열 비구조화? ->단순히 배열의 첫 번째 항목을 꺼내오고 authors 라는 상수로 복원
    res.render('create-post', { authors: authors});// 이 코드는 프로미스 이후에 실행? -> 이제 authors을  create-post에서 사용 가능?
    
});

router.get('/show-music', async function(req,res){ //async = 비동기?
    const [musics] = await db.query('select song_name,singer_name, song_year,song_gen, song_feel from blog.song s ,blog.singerinfo s1 ,blog.singer2song s2 where s.song_no = s2.song_no and s1.singer_no = s2.sing_no'); //[result ]=  배열 비구조화? ->단순히 배열의 첫 번째 항목을 꺼내오고 authors 라는 상수로 복원
    res.render('show-music', { musics: musics});// 이 코드는 프로미스 이후에 실행? -> 이제 music을  create-post에서 사용 가능?
});

router.get('/my-playlist', async function(req,res){ //async = 비동기?
    const [musics] = await db.query('select song_name,singer_name, song_id  from blog.myplaylist1 m'); //[result ]=  배열 비구조화? ->단순히 배열의 첫 번째 항목을 꺼내오고 authors 라는 상수로 복원
    res.render('my-playlist', { musics: musics});// 이 코드는 프로미스 이후에 실행? -> 이제 music을  create-post에서 사용 가능?
});

router.get('/create-playlist', async function(req,res){ //async = 비동기?
    const [songnames] = await db.query('SELECT Distinct song_name  from blog.song s ,blog.singerinfo s1 ,blog.singer2song s2 where s.song_no = s2.song_no and s1.singer_no = s2.sing_no ');
    const [singernames] = await db.query('SELECT Distinct singer_name from blog.song s ,blog.singerinfo s1 ,blog.singer2song s2 where s.song_no = s2.song_no and s1.singer_no = s2.sing_no ');
    const [songgenres] = await db.query('SELECT Distinct song_gen from blog.song s ,blog.singerinfo s1 ,blog.singer2song s2 where s.song_no = s2.song_no and s1.singer_no = s2.sing_no ');
    const [songyears] = await db.query('SELECT Distinct song_year from blog.song s ,blog.singerinfo s1 ,blog.singer2song s2 where s.song_no = s2.song_no and s1.singer_no = s2.sing_no order by song_year ');
    const [songcountries] = await db.query('SELECT Distinct song_country from blog.song s ,blog.singerinfo s1 ,blog.singer2song s2 where s.song_no = s2.song_no and s1.singer_no = s2.sing_no ');
    const [songfeels] = await db.query('SELECT Distinct song_feel  from blog.song s ,blog.singerinfo s1 ,blog.singer2song s2 where s.song_no = s2.song_no and s1.singer_no = s2.sing_no ');
    
    res.render('create-playlist', { songnames: songnames , singernames:singernames , songgenres:songgenres, songyears:songyears, songcountries: songcountries, songfeels:songfeels});
});

router.post('/Create-view', async function(req,res){
    const data = [
        req.body.singername,
        req.body.songgenre,
        req.body.songfeel
    ];   //create-post.ejs 에서 할당한 name 필드의 이름에 따라 키 결정

    const [createdviews] = await db.query('SELECT Distinct song_name, singer_name, song_gen ,song_year ,song_feel from blog.song s ,blog.singerinfo s1 ,blog.singer2song s2 where s.song_no = s2.song_no and s1.singer_no = s2.sing_no  and singer_name = ? and song_gen = ? and song_feel = ?',[
        data[0], data[1], data[2]  
   ]);
    res.render('show-view', { createdviews: createdviews});
}); 

router.post('/posts', async function(req,res){
    const data = [
        req.body.title,
        req.body.summary,
        req.body.content,
        req.body.author,
    ];   //create-post.ejs 에서 할당한 name 필드의 이름에 따라 키 결정
 
    await db.query('INSERT INTO posts (title, summary, body, author_id) VALUES (?,?,?,?)',[
        data[0], data[1], data[2], data[3]
    ]);
    res.redirect('/posts');// 새 게시물 삽입시만다 모든 게시물 페이지로 리다이렉션
}); // 게시물에서의 post 요청 수신

router.post('/register', async function(req,res){
    const data = [
        req.body.name,
        req.body.email
    ];   //user-login.ejs 에서 할당한 name 필드의 이름에 따라 키 결정

    await db.query('INSERT INTO authors (name, email) VALUES (?,?)',[
        data[0], data[1]
    ]);
    
    res.redirect('/show-music');// 새 게시물 삽입시만다 모든 게시물 페이지로 리다이렉션

}); // 게시물에서의 post 요청 수신

router.post('/log-in', async function(req,res){
    const data = [
        req.body.name,
        req.body.email
    ];   
    var sql = 'SELECT exists(select * from authors a where a.name = "s" and a.email = "s")' ;
    const userexist = await db.query('SELECT exists(select * from authors a where a.name = "?" and a.email = "?" )',[
        data[0], data[1] 
   ]);
    
   if(userexist[0] = 1){
    res.send(
        `<script>
          alert('아이디가 확인되었습니다');
          document.location.href="/show-music";
        </script>`
      );
    
   }
   else{
    res.send(
        `<script>
          alert('회원등록을 해주세요.');
        </script>`
      );
   }
   
}); // 게시물에서의 post 요청 수신

router.post('/update-playlist', async function(req,res){
    const data = [
        req.body.title,
        req.body.name
    ];   

    await db.query('INSERT INTO myplaylist1 (song_name, singer_name, song_id ) SELECT song_name, singer_name ,s.song_no from blog.song s ,blog.singerinfo s1 ,blog.singer2song s2 where s.song_no = s2.song_no and s1.singer_no = s2.sing_no and song_name = ? ',[
        data[0]
    ]);
    
}); // 게시물에서의 post 요청 수신

router.get('/posts/:id', async function(req,res){
    const query = ' SELECT  posts.* ,authors.name AS author_name, authors.email AS author_email FROM posts INNER JOIN authors ON  posts.author_id = authors.id WHERE posts.id = ? ';
    const [posts] = await db.query(query, [req.params.id]); //id값 추출해서 값으로 전달 (query에 해당하는 값이 배열로 전달) //params.id는 ? 에 들어갈 값을 매개변수로 전달
    
    if(!posts || posts.length ===0){
        return res.status(404).render('404'); // 404 오류 알리고 404 템플릿 렌더링

    }
    const postData = {
        ...posts[0], // 스프레드 연산자, 게시물의 모든 데이터를 가져웜 
        date: posts[0].date.toISOString(),
        humanReadableDate: posts[0].date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    };

    res.render('post-detail', {post : postData }); //post = key, posts[]는 값  -> post-detail에 전달
});

router.get('/posts/:id/edit', async function(req,res){
    const query = 'SELECT * FROM posts WHERE id = ?';
    const [posts] = await db.query(query, [req.params.id]); // 이 []는 ? 에 들어갈 모든 값들을 전달하는 매개변수
    
    if(!posts || posts.length ===0){
        return res.status(404).render('404'); // 404 오류 알리고 404 템플릿 렌더링

    }
    
    res.render('update-post', {post: posts[0] });
});


router.post('/posts/:id/edit', async function(req,res){ //데이터베이스 업데이트 기능
    const query = 'UPDATE posts SET title = ?, summary = ?, body = ? WHERE id = ?';

    await db.query(query, [req.body.title, req.body.summary, req.body.content, req.params.id]);

    res.redirect('/posts');
});

router.post('/posts/:id/delete', async function(req,res){ //데이터베이스 삭제 기능(delete)
    const query = 'DELETE FROM posts WHERE id = ?';

    await db.query(query, [req.params.id]);

    res.redirect('/posts');
});

router.post('/my-playlist-delete', async function(req,res){ //데이터베이스 삭제 기능(delete)
    const query = 'DELETE FROM myplaylist1 WHERE song_id = ?'; 
    await db.query(query, [req.body.song_id]);

    res.redirect('/my-playlist');
});
module.exports = router;
