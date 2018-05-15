--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.5
-- Dumped by pg_dump version 9.5.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_pkey;
ALTER TABLE ONLY public.transactions DROP CONSTRAINT transactions_address_key;
ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.transactions ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.users_id_seq;
DROP TABLE public.users;
DROP SEQUENCE public.transactions_id_seq;
DROP TABLE public.transactions;
DROP EXTENSION plpgsql;
DROP SCHEMA public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE transactions (
    id integer NOT NULL,
    address character varying(255),
    "funcName" character varying(255),
    "contractAddress" character varying(255),
    "targetAddress" character varying(255),
    params text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE transactions_id_seq OWNED BY transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE users (
    id integer NOT NULL,
    email character varying(255),
    dob timestamp with time zone,
    "firstName" character varying(255),
    "lastName" character varying(255),
    address1 character varying(255),
    address2 character varying(255),
    city character varying(255),
    state character varying(255),
    country character varying(255),
    "postalCode" character varying(255),
    "phNumber" character varying(255),
    password character varying(255),
    salt character varying(255),
    kyc boolean,
    "emailVerified" boolean,
    "btcAddress" text,
    "btcKey" text,
    "ethAddress" text,
    "privateEthAddress" text,
    "privateBtcAddress" text,
    "ethAccountCreated" boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions ALTER COLUMN id SET DEFAULT nextval('transactions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO transactions VALUES (293, '0x548327c51a025ed12fe34a6069ed03591506a493efcb72385b454f91f0e724be', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":1375515818431912000}', '2016-12-26 23:10:03.521+00', '2016-12-26 23:10:03.521+00');
INSERT INTO transactions VALUES (237, 'e19155748754e7435d65c92873a344416ef4e6fff6664f08d8f59568304a93e8', 'depositBTC', 'BTC', 'mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR', '{"from":"mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR","to":"miR3vD42R6v4WeX4SBuSaqAkAztDhtgMzt","quantity":2527.4305193553787}', '2016-12-20 11:15:19.419+00', '2016-12-20 11:15:19.419+00');
INSERT INTO transactions VALUES (182, '0xe8bc8a26b9bd1c6730ebe3e155ab4b613637b2775e2467063445ba3b768c23d8', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":25935419249942490}', '2016-12-20 09:40:54.442+00', '2016-12-20 09:40:54.442+00');
INSERT INTO transactions VALUES (188, '0x6848961ee1e1a32aab1f46b112a5216efddb3803150be6bd5bdf89d0b0754383', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26216230853375596}', '2016-12-20 10:28:50.242+00', '2016-12-20 10:28:50.242+00');
INSERT INTO transactions VALUES (196, '0x19904de117fdfb80885a6ab691d6c611e187ece6bf5ff6f7f528983196e30ee8', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26216230853375596}', '2016-12-20 10:34:22.424+00', '2016-12-20 10:34:22.424+00');
INSERT INTO transactions VALUES (9, '0x39c8fdd322d15410221b989d9ed0ecec4d621c849d877335f6f8177649287663', 'createUser', '0x8266bc94575b401f55051d1bb9306dec45064dbd', '0x3f11a9ddfc5d12cd4d42e22ad2d0800453c8e3c1', '{"email":"0x3f11a9ddfc5d12cd4d42e22ad2d0800453c8e3c1","address":"0x3f11a9ddfc5d12cd4d42e22ad2d0800453c8e3c1","meta":"0x3f11a9ddfc5d12cd4d42e22ad2d0800453c8e3c1"}', '2016-12-14 02:04:34.464+00', '2016-12-14 02:04:34.464+00');
INSERT INTO transactions VALUES (215, '0xdd3ef4317a8d552fd218dbeec2f3d7608ec0783c4a3c380b6cdf5ca28f417840', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":25886445103918610}', '2016-12-20 11:07:03.92+00', '2016-12-20 11:07:03.92+00');
INSERT INTO transactions VALUES (256, '4828b451cca167f8299f783091f3ff407cca2b38a5190f349966fa8c772bd0fd', 'depositBTC', 'BTC', 'mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR', '{"from":"mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR","to":"miR3vD42R6v4WeX4SBuSaqAkAztDhtgMzt","quantity":2528.4168772837925}', '2016-12-20 11:46:08.842+00', '2016-12-20 11:46:08.842+00');
INSERT INTO transactions VALUES (21, '0x333feaee3193cd1b0b5f6b87ab4a6fb28e1bf4725708e586a9efe5b9f65aeb6c', 'createUser', '0x8266bc94575b401f55051d1bb9306dec45064dbd', '0x7a76a0e35a1d653d80c0b5cb18ad319f8ece3dfb', '{"email":"0x7a76a0e35a1d653d80c0b5cb18ad319f8ece3dfb","address":"0x7a76a0e35a1d653d80c0b5cb18ad319f8ece3dfb","meta":"0x7a76a0e35a1d653d80c0b5cb18ad319f8ece3dfb"}', '2016-12-14 02:55:57.564+00', '2016-12-14 02:55:57.564+00');
INSERT INTO transactions VALUES (150, '0x1ddebc2f4962bf55a4ca8247fd4d933f7dadebf4310d0ecb048a54204ff8eaa8', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26101854075512304}', '2016-12-20 08:35:43.652+00', '2016-12-20 08:35:43.652+00');
INSERT INTO transactions VALUES (294, '1bdd3c621ed78a4884032221a7b10e018755ede15944b14e2841c3489d3f72a3', 'depositBTC', 'BTC', 'mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR', '{"from":"mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR","to":"miR3vD42R6v4WeX4SBuSaqAkAztDhtgMzt","quantity":50}', '2016-12-26 23:11:20.768+00', '2016-12-26 23:11:20.768+00');
INSERT INTO transactions VALUES (273, '0x018c5b9517012defbf88eac3a83f5f97b252c16ca13e909ca52d3a0c2f9be620', 'createUser', '0x35e7d1bdcd7c014b6014ece944e00d66bb0506bd', '0x91ef674c8bfe588c43388df265d0f773d8b1e5e0', '{"address":"0x91ef674c8bfe588c43388df265d0f773d8b1e5e0","username":"0x91ef674c8bfe588c43388df265d0f773d8b1e5e0","meta":"0x91ef674c8bfe588c43388df265d0f773d8b1e5e0"}', '2016-12-22 09:06:59.281+00', '2016-12-22 09:06:59.281+00');
INSERT INTO transactions VALUES (274, '0x1e4655615848772ba8d205f0fc41d0a5d6b15bcd1c88f2af8de948426d4b6ddb', 'createUser', '0x8266bc94575b401f55051d1bb9306dec45064dbd', '0x91ef674c8bfe588c43388df265d0f773d8b1e5e0', '{"email":"0x91ef674c8bfe588c43388df265d0f773d8b1e5e0","address":"0x91ef674c8bfe588c43388df265d0f773d8b1e5e0","meta":"0x91ef674c8bfe588c43388df265d0f773d8b1e5e0"}', '2016-12-22 09:06:59.295+00', '2016-12-22 09:06:59.295+00');
INSERT INTO transactions VALUES (148, '0x19ee010a720d6a5ca2530b675fa40fa96442af14aa8814029133baface9edd7e', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26101854075512304}', '2016-12-20 08:34:55.659+00', '2016-12-20 08:34:55.659+00');
INSERT INTO transactions VALUES (178, '0xae52a5c41cb5de7ede3b9fab884314d666adfae6d1e3fb07e9411c230370f699', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":25993295985853740}', '2016-12-20 09:29:34.005+00', '2016-12-20 09:29:34.005+00');
INSERT INTO transactions VALUES (184, '0x7713a88682cf7ba6d1e686bf5cef77663c2f02860edddcb781c53d75ebafff23', 'depositETH', '', '0x1928ed1f3493e30c36a1bf24d9fa275222ad9ff8', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x1928ed1f3493e30c36a1bf24d9fa275222ad9ff8","quantity":1311881883318793}', '2016-12-20 10:20:07.664+00', '2016-12-20 10:20:07.664+00');
INSERT INTO transactions VALUES (53, '0x1c574bfc1d398bb489f09d6d818fd258488ed45b56944c62ed64497aa4b3c1c8', 'createUser', '0x35e7d1bdcd7c014b6014ece944e00d66bb0506bd', '0x12b87d77535b2ac95007cb71e1e557d2cf7c5f89', '{"address":"0x12b87d77535b2ac95007cb71e1e557d2cf7c5f89","username":"0x12b87d77535b2ac95007cb71e1e557d2cf7c5f89","meta":"0x12b87d77535b2ac95007cb71e1e557d2cf7c5f89"}', '2016-12-14 05:13:48.246+00', '2016-12-14 05:13:48.246+00');
INSERT INTO transactions VALUES (190, '0x2e1db65af9aa9b67f8cd3f6fb5dbbd13dac3f72486a598e530329845c50128cf', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26216230853375596}', '2016-12-20 10:30:13.036+00', '2016-12-20 10:30:13.036+00');
INSERT INTO transactions VALUES (267, '0x617913ff0bb672f1b1191a9b005e549d06cb2f713bc7d2aa654feb1565c6f396', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":25806451746097816}', '2016-12-20 11:48:48.845+00', '2016-12-20 11:48:48.845+00');
INSERT INTO transactions VALUES (280, '0x2babfff41a495204b59eefe9760e118bd700107f43622b479b16c2a714750ba8', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26391378374781840}', '2016-12-22 09:07:28.651+00', '2016-12-22 09:07:28.651+00');
INSERT INTO transactions VALUES (123, '0x73d6b3c17be7b3840cebdf065a324f9dc061cf1fc233376db4ade4c00d132d1c', 'createUser', '0x8266bc94575b401f55051d1bb9306dec45064dbd', '0x9eb6707b975172cb2a3269f76711a0a8def07e09', '{"email":"0x9eb6707b975172cb2a3269f76711a0a8def07e09","address":"0x9eb6707b975172cb2a3269f76711a0a8def07e09","meta":"0x9eb6707b975172cb2a3269f76711a0a8def07e09"}', '2016-12-20 07:44:20.37+00', '2016-12-20 07:44:20.37+00');
INSERT INTO transactions VALUES (152, '0x6e4cb288c5742367c52fb3101c468720342453a6042cc7f2b1a5d30d114ae26f', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26101854075512304}', '2016-12-20 08:36:39.997+00', '2016-12-20 08:36:39.997+00');
INSERT INTO transactions VALUES (235, '0xd79c349cd0ea004e68eaa2053eaecf224dc9c2378d610b06378a4311217c8f6e', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26068368958618348}', '2016-12-20 11:15:13.144+00', '2016-12-20 11:15:13.144+00');
INSERT INTO transactions VALUES (282, '8bcbb14fc9ebfa0b4b5e595b0bbe4ed35e1b726b0ed301e3f77991c490a40a93', 'depositBTC', 'BTC', 'mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR', '{"from":"mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR","to":"miR3vD42R6v4WeX4SBuSaqAkAztDhtgMzt","quantity":2310.1389225142443}', '2016-12-22 09:07:36.411+00', '2016-12-22 09:07:36.411+00');
INSERT INTO transactions VALUES (291, '0x3e615b7984cfb870489c38863c95aff2429291015d91f07a73b0342156050c68', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":1375515818431912000}', '2016-12-26 23:08:35.832+00', '2016-12-26 23:08:35.832+00');
INSERT INTO transactions VALUES (174, '0x9ad0c31dd1764959fa4e0680173c4e0f0cbf70bb3774657bed014f0f205cd317', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":25911289660453164}', '2016-12-20 08:46:16.897+00', '2016-12-20 08:46:16.897+00');
INSERT INTO transactions VALUES (180, '0x594b25b83bc3590eedc43351f6ea5274921c6cfc8f74f10451385edd1a3619ab', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":25993295985853740}', '2016-12-20 09:33:02.126+00', '2016-12-20 09:33:02.126+00');
INSERT INTO transactions VALUES (186, '0x494b7db047e3aa1777407c1098ee87ae74a397c168a4f7054c190aee008f3ad7', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26216230853375596}', '2016-12-20 10:27:20.958+00', '2016-12-20 10:27:20.958+00');
INSERT INTO transactions VALUES (193, '0xe304d4631d4449a3ad3d8493bc2078a6a0134f1a783ac9a5a9d74e18d3a32739', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":26216230853375596}', '2016-12-20 10:32:45.727+00', '2016-12-20 10:32:45.727+00');
INSERT INTO transactions VALUES (213, 'a3579ca9eb45bf1c121d6659c177ad72ae6d5ebbf867247c923198bc1eb718b8', 'depositBTC', 'BTC', 'mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR', '{"from":"mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR","to":"miR3vD42R6v4WeX4SBuSaqAkAztDhtgMzt","quantity":2527.6739219755086}', '2016-12-20 11:06:01.378+00', '2016-12-20 11:06:01.378+00');
INSERT INTO transactions VALUES (248, '0xd2d8733607f523f8b887381527fa54af31677d76c8a9fd8d9a268ef9f8d25ca3', 'depositETH', '', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '{"from":"0x3effc4c57064e49ec1671fc876c00ed805b06769","to":"0x81bd72a7c1116fe84b091c1d4d5435a6639e6807","quantity":25806451746097816}', '2016-12-20 11:44:54.12+00', '2016-12-20 11:44:54.12+00');


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('transactions_id_seq', 294, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO users VALUES (2, 'hrishioa@gmail.com', '1994-09-12 00:00:00+00', 'Parag', 'Bhatnagar', '16 College', 'Avenue West', 'Singapore', 'Singapore', 'Singapore', '1241243', '23123', '57bb5e91d7760eb1405c503dbd15dc01e9ddf29b704aaace497476ddf0974f7e1e443119f1c7ea6bcd579ab70c56413654f0b6f1cdd04c9431868aea69242950', 'ba0567e5faacc5d87b0e0eeb338d007d', false, false, '15Jd3wJCXZnogYLgnTFnJqSNuX5meeMA3j', 'KyU3CMJrEfiZ5ZG4NDfNXaRm1tiYYPz16eczcjF7geK74qg6Rsb3', '0x1928ed1f3493e30c36a1bf24d9fa275222ad9ff8', '', '', false, '2016-12-10 19:58:35.29+00', '2016-12-10 19:58:42.783+00');
INSERT INTO users VALUES (96, 'tuser@tuser.com', '2016-12-14 02:54:28.222+00', 'Hrishi', 'Olickel', NULL, '', 'Singapore', 'Singapore', 'Singapore', '137362', NULL, 'dd786acc5baa36525f13f2db3d1b279ea88f34237e0c45db7bf52594f212d0cfe49790e37443845d4a827027e40d801456d68a67e4ad573601c21d342f6ab17b', 'a8e143e787d0331016e9cc51effd1190', false, false, 'miR3vD42R6v4WeX4SBuSaqAkAztDhtgMzt', 'cV7nsVtWAVCPKjmVusxoqq4TPRG2w9tj9GaM125GRgjaRB52z9Ms', '0x81bd72a7c1116fe84b091c1d4d5435a6639e6807', '0xBafbafbafbaf', 'mpHUVgexZEa1fg4tDiZRut27WhJTjYLXHR', false, '2016-12-14 06:17:46.051+00', '2016-12-22 09:02:01.263+00');


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('users_id_seq', 120, true);


--
-- Name: transactions_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_address_key UNIQUE (address);


--
-- Name: transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

