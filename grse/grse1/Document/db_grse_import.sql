--
-- PostgreSQL database dump
--

-- Dumped from database version 14.0
-- Dumped by pg_dump version 14.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: status_t; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_t AS ENUM (
    'active',
    'inactive',
    'delete'
);


ALTER TYPE public.status_t OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id integer NOT NULL,
    user_id integer NOT NULL,
    punch_type character varying(10) NOT NULL,
    punch_time timestamp without time zone NOT NULL,
    terminal_id integer NOT NULL,
    sap_sync boolean NOT NULL,
    sap_sync_time timestamp without time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attendance_id_seq OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: auth_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_log (
    id integer NOT NULL,
    user_id integer NOT NULL,
    terminal_id integer NOT NULL,
    index_key integer NOT NULL,
    event_time timestamp without time zone NOT NULL,
    auth_type integer NOT NULL,
    auth_result integer NOT NULL,
    func integer NOT NULL,
    func_type integer NOT NULL,
    terminal_name character varying(50) NOT NULL,
    log_image text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.auth_log OWNER TO postgres;

--
-- Name: auth_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_log_id_seq OWNER TO postgres;

--
-- Name: auth_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_log_id_seq OWNED BY public.auth_log.id;


--
-- Name: department; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.department (
    id integer NOT NULL,
    unit_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(128),
    shop_name character varying(50),
    cost_center character varying(20),
    hod character varying(50),
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.department OWNER TO postgres;

--
-- Name: department_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.department_id_seq OWNER TO postgres;

--
-- Name: department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.department_id_seq OWNED BY public.department.id;


--
-- Name: designations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designations (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(50) NOT NULL,
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.designations OWNER TO postgres;

--
-- Name: designations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.designations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.designations_id_seq OWNER TO postgres;

--
-- Name: designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;


--
-- Name: finger_masters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.finger_masters (
    id integer NOT NULL,
    alpeta_value integer NOT NULL,
    name character varying(20) NOT NULL
);


ALTER TABLE public.finger_masters OWNER TO postgres;

--
-- Name: finger_masters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.finger_masters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.finger_masters_id_seq OWNER TO postgres;

--
-- Name: finger_masters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.finger_masters_id_seq OWNED BY public.finger_masters.id;


--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    slug character varying(20) NOT NULL,
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_id_seq OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    code character varying(20) NOT NULL,
    shift_start_time time without time zone NOT NULL,
    shift_end_time time without time zone NOT NULL,
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.shifts_id_seq OWNER TO postgres;

--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: subarea; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subarea (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(128),
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.subarea OWNER TO postgres;

--
-- Name: subarea_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subarea_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subarea_id_seq OWNER TO postgres;

--
-- Name: subarea_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subarea_id_seq OWNED BY public.subarea.id;


--
-- Name: terminals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.terminals (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    short_code character varying(10) NOT NULL,
    terminal_type character varying(10) NOT NULL,
    description character varying(128),
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.terminals OWNER TO postgres;

--
-- Name: terminals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.terminals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.terminals_id_seq OWNER TO postgres;

--
-- Name: terminals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.terminals_id_seq OWNED BY public.terminals.id;


--
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    id integer NOT NULL,
    subarea_id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(128),
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.units OWNER TO postgres;

--
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.units_id_seq OWNER TO postgres;

--
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- Name: user_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_cards (
    id integer NOT NULL,
    user_id integer NOT NULL,
    cardnum character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.user_cards OWNER TO postgres;

--
-- Name: user_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_cards_id_seq OWNER TO postgres;

--
-- Name: user_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_cards_id_seq OWNED BY public.user_cards.id;


--
-- Name: user_facedatas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_facedatas (
    id integer NOT NULL,
    user_id integer NOT NULL,
    templatesize integer NOT NULL,
    templatedata text NOT NULL,
    templatetype integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.user_facedatas OWNER TO postgres;

--
-- Name: user_facedatas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_facedatas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_facedatas_id_seq OWNER TO postgres;

--
-- Name: user_facedatas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_facedatas_id_seq OWNED BY public.user_facedatas.id;


--
-- Name: user_fingerprints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_fingerprints (
    id integer NOT NULL,
    user_id integer NOT NULL,
    alpeta_user_id integer NOT NULL,
    fingerid integer NOT NULL,
    totalsize integer NOT NULL,
    templatedata text NOT NULL,
    template1 text NOT NULL,
    template2 text NOT NULL,
    convimage1 text NOT NULL,
    convimage2 text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.user_fingerprints OWNER TO postgres;

--
-- Name: user_fingerprints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_fingerprints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_fingerprints_id_seq OWNER TO postgres;

--
-- Name: user_fingerprints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_fingerprints_id_seq OWNED BY public.user_fingerprints.id;


--
-- Name: user_terminals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_terminals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    terminal_id integer NOT NULL,
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.user_terminals OWNER TO postgres;

--
-- Name: user_terminals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_terminals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_terminals_id_seq OWNER TO postgres;

--
-- Name: user_terminals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_terminals_id_seq OWNED BY public.user_terminals.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    employee_id character varying(20),
    depertment_id integer,
    vendor_id integer,
    alpeta_user_id integer,
    designation_id integer,
    role_id integer NOT NULL,
    shift_id integer,
    first_name character varying(50) NOT NULL,
    middle_name character varying(50),
    last_name character varying(50) NOT NULL,
    dob date,
    gender character varying(10),
    nationality character varying(10),
    marital_status character varying(10),
    address character varying(255),
    email character varying(128),
    phone character varying(50) NOT NULL,
    esi_no character varying(50),
    pf_no character varying(50),
    employment_start_date date,
    employment_end_date date,
    password character varying(128) NOT NULL,
    alpeta_password integer,
    profile_picture character varying(255),
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    last_updated_by character varying(20),
    last_update_date date,
    is_deleted integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    name character varying(128) NOT NULL,
    is_deleted integer DEFAULT 0 NOT NULL,
    status public.status_t DEFAULT 'active'::public.status_t NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vendors_id_seq OWNER TO postgres;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: auth_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_log ALTER COLUMN id SET DEFAULT nextval('public.auth_log_id_seq'::regclass);


--
-- Name: department id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department ALTER COLUMN id SET DEFAULT nextval('public.department_id_seq'::regclass);


--
-- Name: designations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);


--
-- Name: finger_masters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finger_masters ALTER COLUMN id SET DEFAULT nextval('public.finger_masters_id_seq'::regclass);


--
-- Name: role id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: subarea id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subarea ALTER COLUMN id SET DEFAULT nextval('public.subarea_id_seq'::regclass);


--
-- Name: terminals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terminals ALTER COLUMN id SET DEFAULT nextval('public.terminals_id_seq'::regclass);


--
-- Name: units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- Name: user_cards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_cards ALTER COLUMN id SET DEFAULT nextval('public.user_cards_id_seq'::regclass);


--
-- Name: user_facedatas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_facedatas ALTER COLUMN id SET DEFAULT nextval('public.user_facedatas_id_seq'::regclass);


--
-- Name: user_fingerprints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_fingerprints ALTER COLUMN id SET DEFAULT nextval('public.user_fingerprints_id_seq'::regclass);


--
-- Name: user_terminals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_terminals ALTER COLUMN id SET DEFAULT nextval('public.user_terminals_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, user_id, punch_type, punch_time, terminal_id, sap_sync, sap_sync_time, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: auth_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_log (id, user_id, terminal_id, index_key, event_time, auth_type, auth_result, func, func_type, terminal_name, log_image, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: department; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department (id, unit_id, code, name, description, shop_name, cost_center, hod, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.designations (id, code, name, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: finger_masters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.finger_masters (id, alpeta_value, name) FROM stdin;
1	1	Right Thumb
2	2	Right Index Finger
3	3	Right Middle Finger
4	4	Right Ring Finger
5	5	Right Little Finger
6	6	Left Thumb
7	7	Left Index Finger
8	8	Left Middle Finger
9	9	Left Ring Finger
10	10	Left Little Finger
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, name, slug, status, created_at, updated_at) FROM stdin;
1	Admin	admin	active	2021-11-05 15:52:46.539387+05:30	\N
2	Vendor Employee	vendoremployee	active	2021-11-05 15:52:46.539387+05:30	\N
3	Employee	employee	active	2021-11-05 15:52:46.539387+05:30	\N
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shifts (id, name, code, shift_start_time, shift_end_time, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subarea; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subarea (id, code, name, description, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: terminals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.terminals (id, name, short_code, terminal_type, description, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (id, subarea_id, code, name, description, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_cards (id, user_id, cardnum, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_facedatas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_facedatas (id, user_id, templatesize, templatedata, templatetype, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_fingerprints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_fingerprints (id, user_id, alpeta_user_id, fingerid, totalsize, templatedata, template1, template2, convimage1, convimage2, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_terminals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_terminals (id, user_id, terminal_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, employee_id, depertment_id, vendor_id, alpeta_user_id, designation_id, role_id, shift_id, first_name, middle_name, last_name, dob, gender, nationality, marital_status, address, email, phone, esi_no, pf_no, employment_start_date, employment_end_date, password, alpeta_password, profile_picture, status, last_updated_by, last_update_date, is_deleted, created_at, updated_at) FROM stdin;
1	\N	\N	\N	\N	\N	1	\N	GRSE	\N	ADMIN	\N	\N	\N	\N	\N	admin.ivan@yopmail.com	9876543210	\N	\N	\N	\N	$2b$10$uVyycFHeshX0WBnRtcRUxeQIApIDbj3C7TICO45U89CnJHnHwi2o6	\N	\N	active	\N	\N	0	2021-11-05 15:52:46.539387+05:30	\N
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, name, is_deleted, status, created_at, updated_at) FROM stdin;
\.


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendance_id_seq', 1, false);


--
-- Name: auth_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_log_id_seq', 1, false);


--
-- Name: department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.department_id_seq', 1, false);


--
-- Name: designations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.designations_id_seq', 1, false);


--
-- Name: finger_masters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.finger_masters_id_seq', 10, true);


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_id_seq', 3, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shifts_id_seq', 1, false);


--
-- Name: subarea_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subarea_id_seq', 1, false);


--
-- Name: terminals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.terminals_id_seq', 1, false);


--
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_id_seq', 1, false);


--
-- Name: user_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_cards_id_seq', 1, false);


--
-- Name: user_facedatas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_facedatas_id_seq', 1, false);


--
-- Name: user_fingerprints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_fingerprints_id_seq', 1, false);


--
-- Name: user_terminals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_terminals_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vendors_id_seq', 1, false);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: auth_log auth_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_log
    ADD CONSTRAINT auth_log_pkey PRIMARY KEY (id);


--
-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: finger_masters finger_masters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.finger_masters
    ADD CONSTRAINT finger_masters_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: subarea subarea_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subarea
    ADD CONSTRAINT subarea_pkey PRIMARY KEY (id);


--
-- Name: terminals terminals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terminals
    ADD CONSTRAINT terminals_pkey PRIMARY KEY (id);


--
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- Name: user_cards user_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_cards
    ADD CONSTRAINT user_cards_pkey PRIMARY KEY (id);


--
-- Name: user_facedatas user_facedatas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_facedatas
    ADD CONSTRAINT user_facedatas_pkey PRIMARY KEY (id);


--
-- Name: user_fingerprints user_fingerprints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_fingerprints
    ADD CONSTRAINT user_fingerprints_pkey PRIMARY KEY (id);


--
-- Name: user_terminals user_terminals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_terminals
    ADD CONSTRAINT user_terminals_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: attendance attendance_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_fk1 FOREIGN KEY (terminal_id) REFERENCES public.terminals(id);


--
-- Name: auth_log auth_log_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_log
    ADD CONSTRAINT auth_log_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: auth_log auth_log_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_log
    ADD CONSTRAINT auth_log_fk1 FOREIGN KEY (terminal_id) REFERENCES public.terminals(id);


--
-- Name: department department_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_fk0 FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- Name: units units_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_fk0 FOREIGN KEY (subarea_id) REFERENCES public.subarea(id);


--
-- Name: user_cards user_cards_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_cards
    ADD CONSTRAINT user_cards_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_facedatas user_facedatas_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_facedatas
    ADD CONSTRAINT user_facedatas_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_fingerprints user_fingerprints_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_fingerprints
    ADD CONSTRAINT user_fingerprints_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_fingerprints user_fingerprints_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_fingerprints
    ADD CONSTRAINT user_fingerprints_fk1 FOREIGN KEY (fingerid) REFERENCES public.finger_masters(id);


--
-- Name: user_terminals user_terminals_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_terminals
    ADD CONSTRAINT user_terminals_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_terminals user_terminals_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_terminals
    ADD CONSTRAINT user_terminals_fk1 FOREIGN KEY (terminal_id) REFERENCES public.terminals(id);


--
-- Name: users users_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_fk0 FOREIGN KEY (depertment_id) REFERENCES public.department(id);


--
-- Name: users users_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_fk1 FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: users users_fk2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_fk2 FOREIGN KEY (designation_id) REFERENCES public.designations(id);


--
-- Name: users users_fk3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_fk3 FOREIGN KEY (role_id) REFERENCES public.role(id);


--
-- Name: users users_fk4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_fk4 FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- PostgreSQL database dump complete
--

