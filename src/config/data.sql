create table users(
    userId serial primary key not null,
    userName varchar(20) unique not null,
    profileImg text not null,
    password text not null,
    socketId text
);

insert into users(userName,profileImg,password) values("Ali","ali.jpg","ali99");
insert into users(userName,profileImg,password) values("Vali","vali.jpg","vali99");
insert into users(userName,profileImg,password) values("Qodir","qodir.jpg","qodir99");

create table messages(
    messageId serial not null,
    userIdFrom int references users(userId) not null,
    userIdTo int references users(userId) not null,
    messageType text not null,
    messageBody text not null,
    createAt date
)

insert into messages(userIdFrom,userIdTo,messageType,messageBody,createAt) values(1,2,'plain/text','Salom qalesan',Date.now());
insert into messages(userIdFrom,userIdTo,messageType,messageBody,createAt) values(2,1,'plain/text','Yaxshiman, ozingchi',Date.now());
insert into messages(userIdFrom,userIdTo,messageType,messageBody,createAt) values(1,2,'plain/video','video.mp4',Date.now());
insert into messages(userIdFrom,userIdTo,messageType,messageBody,createAt) values(2,1,'plain/text','Ancha oldin korganman',Date.now());

insert into messages(userIdFrom,userIdTo,messageType,messageBody,createAt) values(1,3,'plain/text','Qodir qalesan',Date.now());

