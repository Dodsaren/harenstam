SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

CREATE TYPE public.order_type AS ENUM (
    'ordered',
    'unordered',
    'random'
);

SET default_tablespace = '';
SET default_with_oids = false;

CREATE TABLE public.category (
    id integer NOT NULL,
    label text NOT NULL
);

CREATE SEQUENCE public.category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.question (
    id integer NOT NULL,
    label text NOT NULL,
    options text[],
    options_solutions integer[],
    free_text_solutions text[],
    category_id integer,
    created timestamp,
    updated timestamp
);

CREATE SEQUENCE public.question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.quiz (
    id integer NOT NULL,
    label text,
    questions_order integer[],
    questions_order_type public.order_type DEFAULT 'unordered'::public.order_type,
    created timestamp,
    updated timestamp
);

CREATE SEQUENCE public.quiz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.quiz_question (
    id integer NOT NULL,
    quiz_id integer NOT NULL,
    question_id integer NOT NULL
);

CREATE SEQUENCE public.quiz_question_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE ONLY public.category ALTER COLUMN id SET DEFAULT nextval('public.category_id_seq'::regclass);
ALTER TABLE ONLY public.question ALTER COLUMN id SET DEFAULT nextval('public.question_id_seq'::regclass);
ALTER TABLE ONLY public.quiz ALTER COLUMN id SET DEFAULT nextval('public.quiz_id_seq'::regclass);
ALTER TABLE ONLY public.quiz_question ALTER COLUMN id SET DEFAULT nextval('public.quiz_question_table_id_seq'::regclass);

COPY public.category (id, label) FROM stdin;
1	Sport
2	Historia
3	Geografi
\.

COPY public.question (id, label, options, options_solutions, category_id) FROM stdin;
1	Hur många bultar finns det i Ölandsbron?	{143,234,"2 345 654",1337}	{0}	1
2	Vad är det bästa med vintern?	{"Att man kan bygga snögrottor","De fina färgerna","Den kalla temperaturen","Att man kan åka skidor"}	{1}	2
3	Fråga nummer 3	{"Svar nummer 1","Svar nummer 2","Svar nummer 3","Svar nummer 4"}	{2}	3
4	Hur många bultar finns det i Ölandsbron?	{143,234,"2 345 654",1337}	{2}	1
5	Vad är det bästa med vintern?	{"Att man kan bygga snögrottor","De fina färgerna","Den kalla temperaturen","Att man kan åka skidor"}	{1}	2
6	Fråga nummer 3	{"Svar nummer 1","Svar nummer 2","Svar nummer 3","Svar nummer 4"}	{2}	3
\.

COPY public.quiz (id, label, questions_order, questions_order_type) FROM stdin;
1	Välkommer till nordpolen	{1,2,3}	unordered
2	Välkommer till nordpolen 2	{3,2,1}	unordered
\.

COPY public.quiz_question (id, quiz_id, question_id) FROM stdin;
1	1	1
2	1	2
3	1	3
4	2	3
5	2	2
6	2	1
\.

SELECT pg_catalog.setval('public.category_id_seq', 3, true);
SELECT pg_catalog.setval('public.question_id_seq', 6, true);
SELECT pg_catalog.setval('public.quiz_id_seq', 2, true);
SELECT pg_catalog.setval('public.quiz_question_table_id_seq', 6, true);

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.quiz
    ADD CONSTRAINT quiz_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.quiz_question
    ADD CONSTRAINT untitled_table_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY public.quiz_question
    ADD CONSTRAINT quiz_question_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.quiz_question
    ADD CONSTRAINT quiz_question_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quiz(id) ON UPDATE CASCADE ON DELETE CASCADE;
