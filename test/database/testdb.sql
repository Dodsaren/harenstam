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

INSERT INTO public.category (label) VALUES ('Sport'), ('Historia'), ('Geografi');

INSERT INTO public.question (label, options, options_solutions, free_text_solutions, category_id, created)
VALUES (
    'Vad heter Danmarks huvudstad?', 
    ARRAY['Stockholm', 'Helsingfors', 'Köpenhamn', 'Oslo'],
    ARRAY[2],
    ARRAY['Köpenhamn'],
    3,
    current_timestamp
),
(
    'Vad heter Sveriges konung i förnamn?',
    ARRAY['Lars', 'Carl', 'Ralf', 'Gustaf'],
    ARRAY[1],
    ARRAY['Carl'],
    3,
    current_timestamp
),
(
    'Vilken svart dryck innehåller koffein?',
    ARRAY['Red Bull', 'Coca Cola', 'Mjölk', 'Kaffe'],
    ARRAY[1,3],
    ARRAY['Coca Cola', 'Cola', 'Kaffe'],
    2,
    current_timestamp
),
(
    'Vad heter grundaren av det svenska företaget IKEA?',
    ARRAY['Kalle Karlsson', 'Nils Nilsson', 'Ewert Ljusberg', 'Ingvar Kamprad'],
    ARRAY[3],
    ARRAY['Ingvar Kamprad'],
    1,
    current_timestamp
),
(
    'Vilket djur är störst i Sverige?',
    ARRAY['Älg', 'Varg', 'Björna', 'Elefant'],
    ARRAY[0],
    ARRAY['Älg', 'Skogens konung'],
    1,
    current_timestamp
),
(
    'Vilken maträtt från Mexico äter vi ofta i Sverige?',
    ARRAY['Sushi', 'Tacos', 'Hamburgare', 'Pizza'],
    ARRAY[1],
    ARRAY['Tacos'],
    3,
    current_timestamp
);

INSERT INTO public.quiz (label, questions_order, questions_order_type, created)
VALUES  ('Jims frågesport deluxe', ARRAY[3,1,2,5,4,6], 'ordered', current_timestamp),
        ('Jeparddy', ARRAY[1,2,3], 'unordered', current_timestamp),
        ('Slumpen avgör', ARRAY[1,2,3], 'random', current_timestamp);

INSERT INTO public.quiz_question (quiz_id, question_id)
VALUES  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
        (2, 1), (2, 2), (2, 3),
        (3, 1), (3, 2), (3, 3);

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
