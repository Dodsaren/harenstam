--
-- PostgreSQL database dump
--

-- Dumped from database version 11.0
-- Dumped by pg_dump version 11.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: order_type; Type: TYPE; Schema: public; Owner: jim.nilsson
--

CREATE TYPE public.order_type AS ENUM (
    'ordered',
    'unordered',
    'random'
);


ALTER TYPE public.order_type OWNER TO "jim.nilsson";

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: category; Type: TABLE; Schema: public; Owner: jim.nilsson
--

CREATE TABLE public.category (
    id integer NOT NULL,
    label text
);


ALTER TABLE public.category OWNER TO "jim.nilsson";

--
-- Name: category_id_seq; Type: SEQUENCE; Schema: public; Owner: jim.nilsson
--

CREATE SEQUENCE public.category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.category_id_seq OWNER TO "jim.nilsson";

--
-- Name: category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jim.nilsson
--

ALTER SEQUENCE public.category_id_seq OWNED BY public.category.id;


--
-- Name: question; Type: TABLE; Schema: public; Owner: jim.nilsson
--

CREATE TABLE public.question (
    id integer NOT NULL,
    label text,
    options text[],
    solutions integer[],
    category_id integer
);


ALTER TABLE public.question OWNER TO "jim.nilsson";

--
-- Name: question_id_seq; Type: SEQUENCE; Schema: public; Owner: jim.nilsson
--

CREATE SEQUENCE public.question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.question_id_seq OWNER TO "jim.nilsson";

--
-- Name: question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jim.nilsson
--

ALTER SEQUENCE public.question_id_seq OWNED BY public.question.id;


--
-- Name: quiz; Type: TABLE; Schema: public; Owner: jim.nilsson
--

CREATE TABLE public.quiz (
    id integer NOT NULL,
    label text,
    questions_order integer[],
    questions_order_type public.order_type DEFAULT 'unordered'::public.order_type
);


ALTER TABLE public.quiz OWNER TO "jim.nilsson";

--
-- Name: quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: jim.nilsson
--

CREATE SEQUENCE public.quiz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quiz_id_seq OWNER TO "jim.nilsson";

--
-- Name: quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jim.nilsson
--

ALTER SEQUENCE public.quiz_id_seq OWNED BY public.quiz.id;


--
-- Name: quiz_question; Type: TABLE; Schema: public; Owner: jim.nilsson
--

CREATE TABLE public.quiz_question (
    id integer NOT NULL,
    quiz_id integer NOT NULL,
    question_id integer NOT NULL
);


ALTER TABLE public.quiz_question OWNER TO "jim.nilsson";

--
-- Name: untitled_table_id_seq; Type: SEQUENCE; Schema: public; Owner: jim.nilsson
--

CREATE SEQUENCE public.untitled_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.untitled_table_id_seq OWNER TO "jim.nilsson";

--
-- Name: untitled_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jim.nilsson
--

ALTER SEQUENCE public.untitled_table_id_seq OWNED BY public.quiz_question.id;


--
-- Name: category id; Type: DEFAULT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.category ALTER COLUMN id SET DEFAULT nextval('public.category_id_seq'::regclass);


--
-- Name: question id; Type: DEFAULT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.question ALTER COLUMN id SET DEFAULT nextval('public.question_id_seq'::regclass);


--
-- Name: quiz id; Type: DEFAULT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.quiz ALTER COLUMN id SET DEFAULT nextval('public.quiz_id_seq'::regclass);


--
-- Name: quiz_question id; Type: DEFAULT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.quiz_question ALTER COLUMN id SET DEFAULT nextval('public.untitled_table_id_seq'::regclass);


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: jim.nilsson
--

COPY public.category (id, label) FROM stdin;
1	Sport
2	Historia
3	Geografi
\.


--
-- Data for Name: question; Type: TABLE DATA; Schema: public; Owner: jim.nilsson
--

COPY public.question (id, label, options, solutions, category_id) FROM stdin;
1	Hur många bultar finns det i Ölandsbron?	{143,234,"2 345 654",1337}	{2}	1
2	Vad är det bästa med vintern?	{"Att man kan bygga snögrottor","De fina färgerna","Den kalla temperaturen","Att man kan åka skidor"}	{1}	2
3	Fråga nummer 3	{"Svar nummer 1","Svar nummer 2","Svar nummer 3","Svar nummer 4"}	{2}	3
4	Hur många bultar finns det i Ölandsbron?	{143,234,"2 345 654",1337}	{2}	1
5	Vad är det bästa med vintern?	{"Att man kan bygga snögrottor","De fina färgerna","Den kalla temperaturen","Att man kan åka skidor"}	{1}	2
6	Fråga nummer 3	{"Svar nummer 1","Svar nummer 2","Svar nummer 3","Svar nummer 4"}	{2}	3
\.


--
-- Data for Name: quiz; Type: TABLE DATA; Schema: public; Owner: jim.nilsson
--

COPY public.quiz (id, label, questions_order, questions_order_type) FROM stdin;
1	Välkommer till nordpolen	{1,2,3}	unordered
2	Välkommer till nordpolen 2	{3,2,1}	unordered
\.


--
-- Data for Name: quiz_question; Type: TABLE DATA; Schema: public; Owner: jim.nilsson
--

COPY public.quiz_question (id, quiz_id, question_id) FROM stdin;
289	1	1
290	1	2
291	1	3
292	2	3
293	2	2
294	2	1
\.


--
-- Name: category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jim.nilsson
--

SELECT pg_catalog.setval('public.category_id_seq', 3, true);


--
-- Name: question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jim.nilsson
--

SELECT pg_catalog.setval('public.question_id_seq', 6, true);


--
-- Name: quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jim.nilsson
--

SELECT pg_catalog.setval('public.quiz_id_seq', 2, true);


--
-- Name: untitled_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jim.nilsson
--

SELECT pg_catalog.setval('public.untitled_table_id_seq', 294, true);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);


--
-- Name: quiz quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.quiz
    ADD CONSTRAINT quiz_pkey PRIMARY KEY (id);


--
-- Name: quiz_question untitled_table_pkey; Type: CONSTRAINT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.quiz_question
    ADD CONSTRAINT untitled_table_pkey PRIMARY KEY (id);


--
-- Name: question question_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quiz_question quiz_question_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jim.nilsson
--

ALTER TABLE ONLY public.quiz_question
    ADD CONSTRAINT quiz_question_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

