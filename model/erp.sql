create table account
(
    id int(32) PRIMARY KEY,--auto increment this
    username varchar(15),
    normalized_username varchar(15),
    email varchar(50) UNIQUE,
    password VARCHAR(300) not null,
    email_confirmed boolean not null DEFAULT FALSE,
    security_stamp VARCHAR(30),
    concurrency_stamp VARCHAR(30),
    phone_number VARCHAR(30) UNIQUE,
    phone_number_confirmed boolean,
    lockout_end datetime,
    two_factor_enabled boolean not null DEFAULT FALSE,
    lockout_enabled boolean,
    access_failed_count int(3) not null default 0,
    first_login boolean,
    code int not null
);
create table privilege
(
    id int(32) PRIMARY KEY,
    action VARCHAR(20) not null,
    description VARCHAR(300)
);
create table role
(
    id int(32) PRIMARY KEY,
    name VARCHAR(20) not null,
    normalized_name VARCHAR(20) not null,
    concurrency_stamp VARCHAR(30),
    description VARCHAR(30)
);
create table role_and_privilege
(
    role_id int(32) REFERENCES role(id) ON DELETE CASCADE,
    privilege_id int(32) REFERENCES privilege(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id,privilege_id)
);
create table user_and_role
(
    user_id int(32) REFERENCES account(id) ON DELETE CASCADE,
    role_id int(32) REFERENCES role(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id,user_id)
);