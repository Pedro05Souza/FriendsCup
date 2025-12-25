--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _ChampionshipToPlayer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_ChampionshipToPlayer" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ChampionshipToPlayer" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: championship; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.championship (
    id text NOT NULL,
    title text NOT NULL,
    created_at timestamp(3) without time zone NOT NULL,
    is_duo boolean NOT NULL,
    winner_id text,
    duo_winner_id text
);


ALTER TABLE public.championship OWNER TO postgres;

--
-- Name: championship_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.championship_group (
    id text NOT NULL,
    championship_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.championship_group OWNER TO postgres;

--
-- Name: duo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.duo (
    id text NOT NULL,
    player_1_id text NOT NULL,
    player_2_id text NOT NULL,
    championship_id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.duo OWNER TO postgres;

--
-- Name: group_player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_player (
    id text NOT NULL,
    player_id text,
    duo_id text,
    championship_group_id text NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    goal_difference integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.group_player OWNER TO postgres;

--
-- Name: match; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match (
    id text NOT NULL,
    championship_id text NOT NULL,
    match_phase text NOT NULL,
    winner_id text,
    duo_winner_id text
);


ALTER TABLE public.match OWNER TO postgres;

--
-- Name: match_participant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_participant (
    id text NOT NULL,
    match_id text NOT NULL,
    player_id text,
    duo_id text,
    goals integer DEFAULT 0 NOT NULL,
    penalty_shootout_goals integer DEFAULT 0
);


ALTER TABLE public.match_participant OWNER TO postgres;

--
-- Name: player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player (
    id text NOT NULL,
    name text NOT NULL,
    intelligence integer NOT NULL,
    defense integer NOT NULL,
    attack integer NOT NULL,
    mentality integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.player OWNER TO postgres;

--
-- Data for Name: _ChampionshipToPlayer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_ChampionshipToPlayer" ("A", "B") FROM stdin;
43c8373f-0428-4a57-ab86-5cfc384dec54	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee
43c8373f-0428-4a57-ab86-5cfc384dec54	47588633-59e2-4fcb-884b-a005d3f213f1
43c8373f-0428-4a57-ab86-5cfc384dec54	feaf1932-499c-4124-b0cf-cd634ff0dfa1
43c8373f-0428-4a57-ab86-5cfc384dec54	d1ec07db-b934-4d4d-b393-f310e7fa1e64
43c8373f-0428-4a57-ab86-5cfc384dec54	dcc024b6-29d4-4050-a28c-61c2cea71088
43c8373f-0428-4a57-ab86-5cfc384dec54	8c09e87c-a821-49b7-8fac-2d777297312f
8e41acb5-84fa-4c55-bc60-20ebf8a15544	47588633-59e2-4fcb-884b-a005d3f213f1
8e41acb5-84fa-4c55-bc60-20ebf8a15544	dcc024b6-29d4-4050-a28c-61c2cea71088
8e41acb5-84fa-4c55-bc60-20ebf8a15544	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee
8e41acb5-84fa-4c55-bc60-20ebf8a15544	7773bb49-a637-4068-b55d-b7ccd9629fb3
8e41acb5-84fa-4c55-bc60-20ebf8a15544	d1ec07db-b934-4d4d-b393-f310e7fa1e64
8e41acb5-84fa-4c55-bc60-20ebf8a15544	8c09e87c-a821-49b7-8fac-2d777297312f
8e41acb5-84fa-4c55-bc60-20ebf8a15544	feaf1932-499c-4124-b0cf-cd634ff0dfa1
d7b908d8-29c0-45fa-a6c6-9dbf78021640	47588633-59e2-4fcb-884b-a005d3f213f1
d7b908d8-29c0-45fa-a6c6-9dbf78021640	8c09e87c-a821-49b7-8fac-2d777297312f
d7b908d8-29c0-45fa-a6c6-9dbf78021640	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee
d7b908d8-29c0-45fa-a6c6-9dbf78021640	4345d5cb-cd60-4c72-b5ec-55a6d6a7e85e
d7b908d8-29c0-45fa-a6c6-9dbf78021640	feaf1932-499c-4124-b0cf-cd634ff0dfa1
d7b908d8-29c0-45fa-a6c6-9dbf78021640	7773bb49-a637-4068-b55d-b7ccd9629fb3
d7b908d8-29c0-45fa-a6c6-9dbf78021640	d1ec07db-b934-4d4d-b393-f310e7fa1e64
453bccd3-3829-46be-a7be-c8c88a556936	feaf1932-499c-4124-b0cf-cd634ff0dfa1
453bccd3-3829-46be-a7be-c8c88a556936	dcc024b6-29d4-4050-a28c-61c2cea71088
453bccd3-3829-46be-a7be-c8c88a556936	47588633-59e2-4fcb-884b-a005d3f213f1
453bccd3-3829-46be-a7be-c8c88a556936	8c09e87c-a821-49b7-8fac-2d777297312f
453bccd3-3829-46be-a7be-c8c88a556936	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee
453bccd3-3829-46be-a7be-c8c88a556936	7773bb49-a637-4068-b55d-b7ccd9629fb3
453bccd3-3829-46be-a7be-c8c88a556936	4345d5cb-cd60-4c72-b5ec-55a6d6a7e85e
913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	feaf1932-499c-4124-b0cf-cd634ff0dfa1
913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	dcc024b6-29d4-4050-a28c-61c2cea71088
913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee
913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	4345d5cb-cd60-4c72-b5ec-55a6d6a7e85e
913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	7773bb49-a637-4068-b55d-b7ccd9629fb3
913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	47588633-59e2-4fcb-884b-a005d3f213f1
913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	d1ec07db-b934-4d4d-b393-f310e7fa1e64
913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	8c09e87c-a821-49b7-8fac-2d777297312f
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3c3f6250-07c8-4b8b-b278-d377860de287	782b298c4aac8d0e3a5c26998a98cfd1c80f65fce8dc59a149ee59abbc063056	2025-07-16 20:45:40.064362+00	20250716201503_init	\N	\N	2025-07-16 20:45:39.929983+00	1
\.


--
-- Data for Name: championship; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.championship (id, title, created_at, is_duo, winner_id, duo_winner_id) FROM stdin;
43c8373f-0428-4a57-ab86-5cfc384dec54	COPA NABOR	2022-01-01 00:00:00	f	8c09e87c-a821-49b7-8fac-2d777297312f	\N
8e41acb5-84fa-4c55-bc60-20ebf8a15544	COPA NABOR	2024-02-24 00:00:00	f	8c09e87c-a821-49b7-8fac-2d777297312f	\N
d7b908d8-29c0-45fa-a6c6-9dbf78021640	COPA NABOR	2024-04-07 00:00:00	f	8c09e87c-a821-49b7-8fac-2d777297312f	\N
89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	COPA DOUGLAS	2024-06-23 00:00:00	t	\N	71255340-ca2d-493a-bdfd-1a4afdda5230
453bccd3-3829-46be-a7be-c8c88a556936	COPA DEIVES	2024-12-14 00:00:00	f	47588633-59e2-4fcb-884b-a005d3f213f1	\N
f4cf3126-d7aa-48bc-92bc-e2d005383cb7	COPA POLAR	2025-06-28 00:00:00	t	\N	6f00b648-c386-4770-a4b9-d3cb09018b07
913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	COPA CHILELA	2025-07-11 00:00:00	f	47588633-59e2-4fcb-884b-a005d3f213f1	\N
\.


--
-- Data for Name: championship_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.championship_group (id, championship_id, created_at) FROM stdin;
b7eac804-8979-48ae-a711-bed890b34ac3	8e41acb5-84fa-4c55-bc60-20ebf8a15544	2025-07-17 00:39:35.932
e6397d6e-491c-4f15-b192-5bd697bd3aa9	8e41acb5-84fa-4c55-bc60-20ebf8a15544	2025-07-17 00:40:06.311
7f707493-392f-4da2-9356-711bc9425519	d7b908d8-29c0-45fa-a6c6-9dbf78021640	2025-07-17 00:53:01.389
ecef1255-f655-4965-952f-78c70e9f0d74	d7b908d8-29c0-45fa-a6c6-9dbf78021640	2025-07-17 00:56:47.095
51cf0f8d-0812-4c61-b93c-94d6d8f71026	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	2025-07-17 01:21:29.179
c225b7a9-24d1-4849-bba9-b025c56cfa70	f4cf3126-d7aa-48bc-92bc-e2d005383cb7	2025-07-17 01:35:05.736
1b1e6f7e-9fd7-4fd8-9b91-5bf3b638a0e6	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	2025-07-17 01:48:57.026
05bd4fbe-63b5-47cd-bf3d-376386c249f3	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	2025-07-17 01:49:47.673
\.


--
-- Data for Name: duo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.duo (id, player_1_id, player_2_id, championship_id, name) FROM stdin;
696abd93-fc5f-4df2-99ba-ef6644da8b02	dcc024b6-29d4-4050-a28c-61c2cea71088	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	Milks
e7bfae5e-11a5-42ba-adab-a92081951fc0	8c09e87c-a821-49b7-8fac-2d777297312f	7773bb49-a637-4068-b55d-b7ccd9629fb3	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	Ferrongheli
c680a89f-55da-436a-83df-14d79b5c45a8	feaf1932-499c-4124-b0cf-cd634ff0dfa1	d1ec07db-b934-4d4d-b393-f310e7fa1e64	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	Barargo
71255340-ca2d-493a-bdfd-1a4afdda5230	47588633-59e2-4fcb-884b-a005d3f213f1	47588633-59e2-4fcb-884b-a005d3f213f1	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	Leo
fba92912-7248-4caf-88f0-344ef71c336f	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	dcc024b6-29d4-4050-a28c-61c2cea71088	f4cf3126-d7aa-48bc-92bc-e2d005383cb7	Pedro & Stertz
6f00b648-c386-4770-a4b9-d3cb09018b07	d1ec07db-b934-4d4d-b393-f310e7fa1e64	8c09e87c-a821-49b7-8fac-2d777297312f	f4cf3126-d7aa-48bc-92bc-e2d005383cb7	Bauer & Ferreira
103e7b6f-8186-4835-ae3a-38320cdbbd71	92b8270c-f86a-48bc-88d3-837826b85ad0	7773bb49-a637-4068-b55d-b7ccd9629fb3	f4cf3126-d7aa-48bc-92bc-e2d005383cb7	Lucas Bauer & Cansan
\.


--
-- Data for Name: group_player; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_player (id, player_id, duo_id, championship_group_id, points, goal_difference) FROM stdin;
798193c5-2e96-4d5a-8e29-92dccd168688	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	e6397d6e-491c-4f15-b192-5bd697bd3aa9	3	3
231a3f4b-bf7b-4360-9568-fd4323b1a841	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	e6397d6e-491c-4f15-b192-5bd697bd3aa9	3	1
8e511e15-8d73-4269-af62-965dfdb3e0f8	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	e6397d6e-491c-4f15-b192-5bd697bd3aa9	0	-4
6bd7bf7d-d816-45db-8d83-eb348d7f0ad8	8c09e87c-a821-49b7-8fac-2d777297312f	\N	05bd4fbe-63b5-47cd-bf3d-376386c249f3	3	3
b29398b7-7d46-4897-972f-0e5527de7096	47588633-59e2-4fcb-884b-a005d3f213f1	\N	1b1e6f7e-9fd7-4fd8-9b91-5bf3b638a0e6	6	7
d2637df4-7585-4331-98f8-e811391d39f0	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	1b1e6f7e-9fd7-4fd8-9b91-5bf3b638a0e6	0	-2
d4bff957-4bc3-4a87-b172-cb49072b01d6	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	05bd4fbe-63b5-47cd-bf3d-376386c249f3	6	8
f04786d3-9b3e-4a82-8dc1-27497b4e738e	\N	696abd93-fc5f-4df2-99ba-ef6644da8b02	51cf0f8d-0812-4c61-b93c-94d6d8f71026	3	0
773f2ead-4edd-4ef7-bde5-d7912a6c5728	\N	c680a89f-55da-436a-83df-14d79b5c45a8	51cf0f8d-0812-4c61-b93c-94d6d8f71026	3	-4
5fdeea1a-3459-4d86-ba28-c3c237aaf103	\N	e7bfae5e-11a5-42ba-adab-a92081951fc0	51cf0f8d-0812-4c61-b93c-94d6d8f71026	6	2
dfb0d37e-deb3-458c-b976-a2263bba53b3	\N	71255340-ca2d-493a-bdfd-1a4afdda5230	51cf0f8d-0812-4c61-b93c-94d6d8f71026	6	2
aa146081-6e4a-4fe9-b782-b3386cf96fd8	8c09e87c-a821-49b7-8fac-2d777297312f	\N	7f707493-392f-4da2-9356-711bc9425519	3	2
ac83ddd5-4404-4432-81da-482d15cb4a71	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	05bd4fbe-63b5-47cd-bf3d-376386c249f3	0	-7
630a7f4e-13a1-41f7-a4e2-90146c60efff	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	ecef1255-f655-4965-952f-78c70e9f0d74	3	4
b93a3074-351e-4291-b1ab-c15e7935ff0a	4345d5cb-cd60-4c72-b5ec-55a6d6a7e85e	\N	ecef1255-f655-4965-952f-78c70e9f0d74	0	-4
00487716-faaf-4450-b76a-48bd77687cb5	47588633-59e2-4fcb-884b-a005d3f213f1	\N	7f707493-392f-4da2-9356-711bc9425519	3	-1
1b454a01-46ae-4242-8d4e-5191f2f05c4e	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	7f707493-392f-4da2-9356-711bc9425519	0	-1
442391e4-2060-45c5-8b93-a757aaa7e63c	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	1b1e6f7e-9fd7-4fd8-9b91-5bf3b638a0e6	6	2
d038a3da-0d6d-4c26-baa0-9455ec28abb4	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	ecef1255-f655-4965-952f-78c70e9f0d74	3	1
fb2ad073-1ef4-4bb0-aa2f-8020fc075165	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	ecef1255-f655-4965-952f-78c70e9f0d74	0	-1
b412ce73-2bdd-4105-ab67-b78ccd96a514	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	1b1e6f7e-9fd7-4fd8-9b91-5bf3b638a0e6	0	-7
642bf8ad-e024-4fae-9664-a15606a82a4d	\N	6f00b648-c386-4770-a4b9-d3cb09018b07	c225b7a9-24d1-4849-bba9-b025c56cfa70	3	3
e15bd203-7bbe-4a1f-98b5-b719018baa3e	47588633-59e2-4fcb-884b-a005d3f213f1	\N	b7eac804-8979-48ae-a711-bed890b34ac3	1	-3
817ae1de-e54c-4d04-b7ae-1d2f5809ae31	\N	fba92912-7248-4caf-88f0-344ef71c336f	c225b7a9-24d1-4849-bba9-b025c56cfa70	6	-1
932e8daf-8539-444c-b2a6-ea18f36e0b3b	\N	103e7b6f-8186-4835-ae3a-38320cdbbd71	c225b7a9-24d1-4849-bba9-b025c56cfa70	0	-2
c081ffb2-efba-476c-b8cc-728936d52c03	4345d5cb-cd60-4c72-b5ec-55a6d6a7e85e	\N	05bd4fbe-63b5-47cd-bf3d-376386c249f3	0	-4
2095156c-bf9c-476b-83e0-0a90c45685e2	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	b7eac804-8979-48ae-a711-bed890b34ac3	4	1
3bdbbfdb-3a06-4498-b5f2-a30bcfe4686a	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	b7eac804-8979-48ae-a711-bed890b34ac3	3	2
\.


--
-- Data for Name: match; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.match (id, championship_id, match_phase, winner_id, duo_winner_id) FROM stdin;
a0a040c4-d9e1-4053-8eeb-ff140154a8d3	d7b908d8-29c0-45fa-a6c6-9dbf78021640	GROUP_STAGE	47588633-59e2-4fcb-884b-a005d3f213f1	\N
02ee9e93-8f2b-450f-95f1-9bdb36e8ce03	d7b908d8-29c0-45fa-a6c6-9dbf78021640	GROUP_STAGE	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N
ed4e19c7-247a-425a-94c6-591ce8f07f28	43c8373f-0428-4a57-ab86-5cfc384dec54	QUARTER_FINALS	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N
835fdfee-1327-4309-91a6-1825a3d6eca9	43c8373f-0428-4a57-ab86-5cfc384dec54	QUARTER_FINALS	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N
47705dcc-b3ef-4284-9578-48e82e9e7c8a	43c8373f-0428-4a57-ab86-5cfc384dec54	SEMIFINALS	dcc024b6-29d4-4050-a28c-61c2cea71088	\N
1cf23c29-a254-4d1b-87f4-338fc2709ecc	43c8373f-0428-4a57-ab86-5cfc384dec54	SEMIFINALS	8c09e87c-a821-49b7-8fac-2d777297312f	\N
2e1fa0ed-8772-40ca-9de3-14834d0d5167	43c8373f-0428-4a57-ab86-5cfc384dec54	FINALS	8c09e87c-a821-49b7-8fac-2d777297312f	\N
ce7f9ad8-fba7-4e05-afb3-88cafa3ed32c	8e41acb5-84fa-4c55-bc60-20ebf8a15544	GROUP_STAGE	dcc024b6-29d4-4050-a28c-61c2cea71088	\N
dc279346-9fa7-4a27-bbc8-67716abc7024	8e41acb5-84fa-4c55-bc60-20ebf8a15544	GROUP_STAGE	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N
a9cbfc6f-3163-48ca-8ae2-a2fd6e19da68	8e41acb5-84fa-4c55-bc60-20ebf8a15544	GROUP_STAGE	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N
12b111b3-28d1-4958-ab31-fb5b4af563fc	8e41acb5-84fa-4c55-bc60-20ebf8a15544	QUARTER_FINALS	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N
ee324c14-e46c-4702-81c2-08fd9a9866b7	8e41acb5-84fa-4c55-bc60-20ebf8a15544	SEMIFINALS	8c09e87c-a821-49b7-8fac-2d777297312f	\N
44be77ba-2889-4b4a-b984-63d189670ce7	8e41acb5-84fa-4c55-bc60-20ebf8a15544	SEMIFINALS	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N
68db54e8-b81b-4418-9799-9eb252122134	8e41acb5-84fa-4c55-bc60-20ebf8a15544	FINALS	8c09e87c-a821-49b7-8fac-2d777297312f	\N
92279333-f876-4440-8ead-9e9fcfe0f850	d7b908d8-29c0-45fa-a6c6-9dbf78021640	GROUP_STAGE	8c09e87c-a821-49b7-8fac-2d777297312f	\N
ae004022-67d5-4f0f-923d-c106b1eb0c96	d7b908d8-29c0-45fa-a6c6-9dbf78021640	SEMIFINALS	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N
82d7d895-417c-4ce5-88ce-277abb8799ea	d7b908d8-29c0-45fa-a6c6-9dbf78021640	GROUP_STAGE	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N
70451ea8-253a-463a-9329-d2f08d3fd072	d7b908d8-29c0-45fa-a6c6-9dbf78021640	SEMIFINALS	8c09e87c-a821-49b7-8fac-2d777297312f	\N
63604c46-a554-4985-a581-d2f97cd8d217	d7b908d8-29c0-45fa-a6c6-9dbf78021640	FINALS	8c09e87c-a821-49b7-8fac-2d777297312f	\N
0c5dd5d0-f5d6-455a-be0d-09b5e5f512de	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	GROUP_STAGE	\N	c680a89f-55da-436a-83df-14d79b5c45a8
f35fc9a0-3296-4d3d-b21b-a5d01e29989a	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	GROUP_STAGE	\N	71255340-ca2d-493a-bdfd-1a4afdda5230
11205484-4fb5-4c07-999d-87c5d744c204	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	GROUP_STAGE	\N	71255340-ca2d-493a-bdfd-1a4afdda5230
609cae7c-7928-46dc-befb-119a8950e5af	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	GROUP_STAGE	\N	71255340-ca2d-493a-bdfd-1a4afdda5230
7edb9fed-22b4-44dc-b101-f35b2a534aae	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	GROUP_STAGE	\N	e7bfae5e-11a5-42ba-adab-a92081951fc0
a638615a-9e0a-4e70-8530-9fd2db125833	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	GROUP_STAGE	\N	696abd93-fc5f-4df2-99ba-ef6644da8b02
24f64fc6-5c41-4be0-8299-fa1f0769b9ad	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	GROUP_STAGE	\N	e7bfae5e-11a5-42ba-adab-a92081951fc0
38475104-9b19-4964-a289-cff2f8850b93	89b2e0fd-51b0-4b9b-bde2-fdec7c4f0e11	FINALS	\N	71255340-ca2d-493a-bdfd-1a4afdda5230
7fa8c9fa-b1a5-48e5-bd97-f938a063b417	453bccd3-3829-46be-a7be-c8c88a556936	QUARTER_FINALS	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N
d71b8e2a-efc8-438f-8fe5-d5f022c4dd6a	453bccd3-3829-46be-a7be-c8c88a556936	QUARTER_FINALS	47588633-59e2-4fcb-884b-a005d3f213f1	\N
8e7e062a-56ef-4aeb-9817-a2f82abe984d	453bccd3-3829-46be-a7be-c8c88a556936	QUARTER_FINALS	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N
89840e88-9308-48dc-999f-1116425c7cb4	453bccd3-3829-46be-a7be-c8c88a556936	SEMIFINALS	47588633-59e2-4fcb-884b-a005d3f213f1	\N
f997374f-ae4f-4235-852f-dbec121711e0	453bccd3-3829-46be-a7be-c8c88a556936	SEMIFINALS	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N
3cd5ae17-8ae6-49f1-a373-c67b94d00b2e	453bccd3-3829-46be-a7be-c8c88a556936	FINALS	47588633-59e2-4fcb-884b-a005d3f213f1	\N
304c4881-81d1-4d0e-ba1e-7adb62c6f56a	f4cf3126-d7aa-48bc-92bc-e2d005383cb7	GROUP_STAGE	\N	6f00b648-c386-4770-a4b9-d3cb09018b07
9912a78e-c271-4f48-b897-b968a854cbc3	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	SEMIFINALS	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N
8b46f4ca-169f-4467-9e6c-95dd6197315f	f4cf3126-d7aa-48bc-92bc-e2d005383cb7	FINALS	\N	6f00b648-c386-4770-a4b9-d3cb09018b07
5ea6f61d-993b-40ea-b917-adf1aecd761d	f4cf3126-d7aa-48bc-92bc-e2d005383cb7	GROUP_STAGE	\N	fba92912-7248-4caf-88f0-344ef71c336f
720289e3-8588-469e-b001-9be6c1dfcaaa	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	GROUP_STAGE	dcc024b6-29d4-4050-a28c-61c2cea71088	\N
e9643ff3-ee01-44f7-a37c-2587a4ea9b57	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	GROUP_STAGE	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N
02d83b9c-fc56-4afc-a300-6fa2a6c9a57a	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	GROUP_STAGE	47588633-59e2-4fcb-884b-a005d3f213f1	\N
1051cafa-3daa-44e1-a613-bb7cd0d2c527	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	GROUP_STAGE	8c09e87c-a821-49b7-8fac-2d777297312f	\N
d91ba0a3-9801-402b-8fc0-5290be760204	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	GROUP_STAGE	47588633-59e2-4fcb-884b-a005d3f213f1	\N
e530cc02-7dba-4fef-b33d-49f53d4f924a	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	GROUP_STAGE	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N
03ee0b9d-0951-49b8-9573-459221bce50c	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	GROUP_STAGE	dcc024b6-29d4-4050-a28c-61c2cea71088	\N
c9beda63-3d9a-419a-9d35-b59f8303e155	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	SEMIFINALS	8c09e87c-a821-49b7-8fac-2d777297312f	\N
30033645-417f-42de-a476-5588a1438eb6	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	FINALS	47588633-59e2-4fcb-884b-a005d3f213f1	\N
906ae939-02fb-4ad8-a13c-6915c048ffd4	913841a8-5a1c-4cce-a018-0d9d6e0d2ea0	THIRD_PLACE	8c09e87c-a821-49b7-8fac-2d777297312f	\N
6de395d6-6826-49f7-a342-8641f5ae2251	8e41acb5-84fa-4c55-bc60-20ebf8a15544	GROUP_STAGE	\N	\N
d49f10c0-8c2f-4fb1-bb60-4da3ad9c4ca0	8e41acb5-84fa-4c55-bc60-20ebf8a15544	GROUP_STAGE	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N
\.


--
-- Data for Name: match_participant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.match_participant (id, match_id, player_id, duo_id, goals, penalty_shootout_goals) FROM stdin;
dc47c642-266d-474c-89fe-7e030af6691f	ed4e19c7-247a-425a-94c6-591ce8f07f28	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	7	0
2f78617e-496a-41a9-b03f-c954910a2a3f	ed4e19c7-247a-425a-94c6-591ce8f07f28	47588633-59e2-4fcb-884b-a005d3f213f1	\N	2	0
83c5aeed-7e5e-476a-8c9b-9fd271d3f082	835fdfee-1327-4309-91a6-1825a3d6eca9	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	1	0
a91f8ff8-2485-4c94-9af9-763335237008	835fdfee-1327-4309-91a6-1825a3d6eca9	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	0	0
26096f39-28f3-4ee8-ae4e-4fe52a37a1c4	47705dcc-b3ef-4284-9578-48e82e9e7c8a	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	1	0
64037b5e-ff0b-4ac8-bb73-2a1383f26a25	47705dcc-b3ef-4284-9578-48e82e9e7c8a	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	0	0
ce75bc09-e49c-4d4c-86a5-c35dd7d9807a	1cf23c29-a254-4d1b-87f4-338fc2709ecc	8c09e87c-a821-49b7-8fac-2d777297312f	\N	1	0
9616ae6d-f263-40d7-94db-e17fabf65a02	1cf23c29-a254-4d1b-87f4-338fc2709ecc	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	0	0
94d8bda1-b787-4a73-8dbc-d0da38854f5d	2e1fa0ed-8772-40ca-9de3-14834d0d5167	8c09e87c-a821-49b7-8fac-2d777297312f	\N	2	0
1748fe37-7589-4b72-8fb4-048a318bbf62	2e1fa0ed-8772-40ca-9de3-14834d0d5167	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	1	0
bd18f07b-645d-4ada-949d-5a3b74e94c5b	ce7f9ad8-fba7-4e05-afb3-88cafa3ed32c	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	4	0
83d7b701-65bb-4ed9-b63a-9f5c7f734e6b	ce7f9ad8-fba7-4e05-afb3-88cafa3ed32c	47588633-59e2-4fcb-884b-a005d3f213f1	\N	1	0
ae9aaa9e-abd3-4524-93ec-7393a5033fc3	dc279346-9fa7-4a27-bbc8-67716abc7024	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	3	0
11664c22-d4ac-4d46-b7ce-049db1ad1ce9	dc279346-9fa7-4a27-bbc8-67716abc7024	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	0	0
a532d29e-6eee-4312-9ea6-83756b1ebb0d	a9cbfc6f-3163-48ca-8ae2-a2fd6e19da68	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	1	0
e134cf24-bb6d-46b5-b2f9-785c27697827	a9cbfc6f-3163-48ca-8ae2-a2fd6e19da68	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	0	0
323a09a8-ee26-46aa-9447-14a7cf8f5963	12b111b3-28d1-4958-ab31-fb5b4af563fc	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	2	0
8fd9f750-eba2-4178-ba00-fc7431f3ff19	12b111b3-28d1-4958-ab31-fb5b4af563fc	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	1	0
93a1bc20-4368-43d9-9ebb-a0e6e17c68a3	ee324c14-e46c-4702-81c2-08fd9a9866b7	8c09e87c-a821-49b7-8fac-2d777297312f	\N	1	0
a8fa3b56-8f6f-4fdc-987c-c18585a5e0b7	ee324c14-e46c-4702-81c2-08fd9a9866b7	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	0	0
aa186de5-ac68-45b6-8234-7dc05cfb8ce8	44be77ba-2889-4b4a-b984-63d189670ce7	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	1	0
912eff65-676f-4549-9184-68670970358c	44be77ba-2889-4b4a-b984-63d189670ce7	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	0	0
6bfd2513-4a67-4bf1-a759-9635ce176df9	68db54e8-b81b-4418-9799-9eb252122134	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	0	0
df758bcd-98c2-498d-8f79-e9d4ea46d6ce	68db54e8-b81b-4418-9799-9eb252122134	8c09e87c-a821-49b7-8fac-2d777297312f	\N	4	0
c4392a6b-f485-424c-9ccc-bc634c9c0ca2	92279333-f876-4440-8ead-9e9fcfe0f850	8c09e87c-a821-49b7-8fac-2d777297312f	\N	8	0
fb07d4ec-38d4-4248-a99e-2035c7d6cff7	92279333-f876-4440-8ead-9e9fcfe0f850	47588633-59e2-4fcb-884b-a005d3f213f1	\N	6	0
1ef906fc-bfe9-4c03-948c-a38c14391be9	82d7d895-417c-4ce5-88ce-277abb8799ea	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	4	0
aadb1b8e-a86c-460d-87cf-fdf0dc8e6d94	82d7d895-417c-4ce5-88ce-277abb8799ea	4345d5cb-cd60-4c72-b5ec-55a6d6a7e85e	\N	0	0
1be006b4-8a90-41fb-bd3e-87f1b3d1a11e	a0a040c4-d9e1-4053-8eeb-ff140154a8d3	47588633-59e2-4fcb-884b-a005d3f213f1	\N	4	0
3001c1dd-c56b-4fba-be5c-ad9822ac5bae	a0a040c4-d9e1-4053-8eeb-ff140154a8d3	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	3	0
d9c306d4-7788-434e-848d-a4bc67fc0376	02ee9e93-8f2b-450f-95f1-9bdb36e8ce03	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	2	0
3c663e2a-3afd-45b0-a2b1-1b55de3b1f74	02ee9e93-8f2b-450f-95f1-9bdb36e8ce03	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	1	0
37880fbe-df66-4565-932a-4a66cd6aa842	ae004022-67d5-4f0f-923d-c106b1eb0c96	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	1	5
d34bf1e6-84fa-4c49-ac21-fae75f700cc5	ae004022-67d5-4f0f-923d-c106b1eb0c96	47588633-59e2-4fcb-884b-a005d3f213f1	\N	1	4
dcc99664-2dfb-4049-b180-028ed52ec79f	70451ea8-253a-463a-9329-d2f08d3fd072	8c09e87c-a821-49b7-8fac-2d777297312f	\N	8	0
7f1d11f1-fa08-4fa0-a8cc-f6c5eaddbbde	70451ea8-253a-463a-9329-d2f08d3fd072	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	1	0
20e86eea-a1e0-4766-9ecf-02d87fbab98d	63604c46-a554-4985-a581-d2f97cd8d217	8c09e87c-a821-49b7-8fac-2d777297312f	\N	4	0
36282dad-2224-4ee3-a21f-f3b0088eeb33	63604c46-a554-4985-a581-d2f97cd8d217	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	3	0
e4f39d04-34a6-4e99-911e-541517d01c4f	0c5dd5d0-f5d6-455a-be0d-09b5e5f512de	\N	c680a89f-55da-436a-83df-14d79b5c45a8	2	0
58908f80-df71-4214-b321-59afd8968eff	0c5dd5d0-f5d6-455a-be0d-09b5e5f512de	\N	e7bfae5e-11a5-42ba-adab-a92081951fc0	1	0
00430cbe-fc58-45d5-9330-000eaedf77a0	f35fc9a0-3296-4d3d-b21b-a5d01e29989a	\N	71255340-ca2d-493a-bdfd-1a4afdda5230	2	0
bbd92ddb-150f-4861-8254-ed138dc61915	f35fc9a0-3296-4d3d-b21b-a5d01e29989a	\N	696abd93-fc5f-4df2-99ba-ef6644da8b02	1	0
0845b0ab-b2ac-4c87-aacb-bfc8147a3ec8	11205484-4fb5-4c07-999d-87c5d744c204	\N	71255340-ca2d-493a-bdfd-1a4afdda5230	4	0
de5dfd36-7498-4fe4-adae-d83bafa6bed2	11205484-4fb5-4c07-999d-87c5d744c204	\N	c680a89f-55da-436a-83df-14d79b5c45a8	3	0
a8ffd8eb-7404-4083-a405-368e3d610316	609cae7c-7928-46dc-befb-119a8950e5af	\N	71255340-ca2d-493a-bdfd-1a4afdda5230	4	0
21317c06-6e4e-42ce-85aa-ff6ff819c01a	609cae7c-7928-46dc-befb-119a8950e5af	\N	c680a89f-55da-436a-83df-14d79b5c45a8	3	0
df4300a7-1bf0-43dd-80c5-c27690064fbe	7edb9fed-22b4-44dc-b101-f35b2a534aae	\N	e7bfae5e-11a5-42ba-adab-a92081951fc0	4	0
31c9ed4f-c9d9-4d62-bc4c-447c88c43c97	7edb9fed-22b4-44dc-b101-f35b2a534aae	\N	696abd93-fc5f-4df2-99ba-ef6644da8b02	1	0
5a402d1f-32a7-48ca-8313-eebf2efc5c2a	a638615a-9e0a-4e70-8530-9fd2db125833	\N	696abd93-fc5f-4df2-99ba-ef6644da8b02	4	0
c5b08636-882f-4aae-b1ee-2151823926d1	a638615a-9e0a-4e70-8530-9fd2db125833	\N	c680a89f-55da-436a-83df-14d79b5c45a8	0	0
bcd1aec8-3d03-4ca9-aa24-90906e2a66c6	24f64fc6-5c41-4be0-8299-fa1f0769b9ad	\N	e7bfae5e-11a5-42ba-adab-a92081951fc0	3	8
b73754e3-5e8f-45b5-a864-7e39f4672889	24f64fc6-5c41-4be0-8299-fa1f0769b9ad	\N	71255340-ca2d-493a-bdfd-1a4afdda5230	3	7
fe9a0c9d-c2a8-446d-aec4-ab25fa639dba	38475104-9b19-4964-a289-cff2f8850b93	\N	e7bfae5e-11a5-42ba-adab-a92081951fc0	6	4
b0e83f08-dbde-4800-90b4-142c2825e035	38475104-9b19-4964-a289-cff2f8850b93	\N	71255340-ca2d-493a-bdfd-1a4afdda5230	6	5
1e089bd3-88f4-4dd8-813b-37fb2e8107a5	7fa8c9fa-b1a5-48e5-bd97-f938a063b417	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	3	0
a301a24a-046f-4ce9-ab32-42a624621abf	7fa8c9fa-b1a5-48e5-bd97-f938a063b417	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	2	0
c656ddd6-32bc-4e9e-8bb6-a96ded0ab7a4	d71b8e2a-efc8-438f-8fe5-d5f022c4dd6a	47588633-59e2-4fcb-884b-a005d3f213f1	\N	1	0
00b26333-5fe4-43c6-a48f-f2bb820e04e2	d71b8e2a-efc8-438f-8fe5-d5f022c4dd6a	8c09e87c-a821-49b7-8fac-2d777297312f	\N	0	0
f5c47e42-1a05-4c64-bdac-d0f789909375	8e7e062a-56ef-4aeb-9817-a2f82abe984d	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	2	0
f2e21df6-3a86-4883-9e55-f017bf79a073	8e7e062a-56ef-4aeb-9817-a2f82abe984d	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	0	0
33de17a4-2056-4b5f-9fa0-32606dd2a98a	89840e88-9308-48dc-999f-1116425c7cb4	47588633-59e2-4fcb-884b-a005d3f213f1	\N	1	0
25cab3d2-0692-4faa-acdc-66ffcb28247e	89840e88-9308-48dc-999f-1116425c7cb4	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	0	0
5058897e-bc52-4a8a-8728-1aa555dd0c98	f997374f-ae4f-4235-852f-dbec121711e0	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	0	2
744c122c-070c-4d1d-87ab-0c10d253e5f7	f997374f-ae4f-4235-852f-dbec121711e0	4345d5cb-cd60-4c72-b5ec-55a6d6a7e85e	\N	0	1
71309110-8c55-44d5-b02e-46fd3c7b3bba	3cd5ae17-8ae6-49f1-a373-c67b94d00b2e	47588633-59e2-4fcb-884b-a005d3f213f1	\N	3	0
8c4a15e6-b7c1-48d4-92bd-8cc6d12e28fc	3cd5ae17-8ae6-49f1-a373-c67b94d00b2e	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	0	0
d951f851-62a8-4698-b494-961f863bb705	304c4881-81d1-4d0e-ba1e-7adb62c6f56a	\N	6f00b648-c386-4770-a4b9-d3cb09018b07	3	0
a92b811f-8c08-40c8-9119-b1034056b112	8b46f4ca-169f-4467-9e6c-95dd6197315f	\N	6f00b648-c386-4770-a4b9-d3cb09018b07	1	0
9bacd90b-fb87-448c-bacf-693b55ca57b3	8b46f4ca-169f-4467-9e6c-95dd6197315f	\N	103e7b6f-8186-4835-ae3a-38320cdbbd71	0	0
ba70a93f-f6d3-49f6-b775-00fa0c73604f	304c4881-81d1-4d0e-ba1e-7adb62c6f56a	\N	fba92912-7248-4caf-88f0-344ef71c336f	0	0
dd84fcfe-6332-44d3-ab41-dfb6c8356732	5ea6f61d-993b-40ea-b917-adf1aecd761d	\N	fba92912-7248-4caf-88f0-344ef71c336f	2	0
684e9c55-d6c8-47b2-9fca-3d7e1c46a506	5ea6f61d-993b-40ea-b917-adf1aecd761d	\N	103e7b6f-8186-4835-ae3a-38320cdbbd71	1	0
d0a046f2-5f5a-47d5-a187-f8f8232e8829	720289e3-8588-469e-b001-9be6c1dfcaaa	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	1	0
295fcf37-e53b-40fe-9d11-daae7e6a64ec	720289e3-8588-469e-b001-9be6c1dfcaaa	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	0	0
18615353-9ad9-410b-a198-911d7e74b79f	e9643ff3-ee01-44f7-a37c-2587a4ea9b57	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	5	0
182b3290-c4ea-4325-8926-6d890a9b72e5	e9643ff3-ee01-44f7-a37c-2587a4ea9b57	4345d5cb-cd60-4c72-b5ec-55a6d6a7e85e	\N	1	0
bf5ac26e-6c9a-4fe8-bd52-3fe2fca068c4	02d83b9c-fc56-4afc-a300-6fa2a6c9a57a	47588633-59e2-4fcb-884b-a005d3f213f1	\N	6	0
3312f7fe-3a5a-4727-9cd5-a63725cd886c	02d83b9c-fc56-4afc-a300-6fa2a6c9a57a	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	0	0
b6905284-fe96-4cca-ad18-487f0c5df97b	1051cafa-3daa-44e1-a613-bb7cd0d2c527	8c09e87c-a821-49b7-8fac-2d777297312f	\N	4	0
2f75b42e-fbfb-444a-95f8-0b0a9f5a8989	1051cafa-3daa-44e1-a613-bb7cd0d2c527	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	1	0
d2db00cd-dc22-40ea-a44d-c45c88064199	d91ba0a3-9801-402b-8fc0-5290be760204	47588633-59e2-4fcb-884b-a005d3f213f1	\N	4	0
82a43a5d-bb12-4dbd-9aca-118348e3d95d	d91ba0a3-9801-402b-8fc0-5290be760204	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	3	0
35658f43-66bb-4885-8679-eddf4ef9bfa2	e530cc02-7dba-4fef-b33d-49f53d4f924a	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	4	0
bf91a346-8cda-4f74-8c5e-e98307a58eb8	e530cc02-7dba-4fef-b33d-49f53d4f924a	d1ec07db-b934-4d4d-b393-f310e7fa1e64	\N	0	0
873789c4-6a3e-4cdd-865b-b9debec4009c	03ee0b9d-0951-49b8-9573-459221bce50c	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	1	0
6a7c6886-3075-4cdc-8886-efe8fd27ab95	03ee0b9d-0951-49b8-9573-459221bce50c	7773bb49-a637-4068-b55d-b7ccd9629fb3	\N	0	0
9c21760a-4db9-404a-aec1-bff5246ed6a2	9912a78e-c271-4f48-b897-b968a854cbc3	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	2	0
1843a15a-1993-40e0-bc81-90a58d35e9ff	9912a78e-c271-4f48-b897-b968a854cbc3	8c09e87c-a821-49b7-8fac-2d777297312f	\N	1	0
d26a3fc2-3717-4b14-9566-ad3a7d9273a1	c9beda63-3d9a-419a-9d35-b59f8303e155	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	0	0
1b8e815c-fc5a-41a7-aaf7-230ed511c988	30033645-417f-42de-a476-5588a1438eb6	47588633-59e2-4fcb-884b-a005d3f213f1	\N	5	0
180c8dea-ef44-48e0-9321-df1aa8489ff3	30033645-417f-42de-a476-5588a1438eb6	d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	\N	0	0
75000bcf-8d6f-48e8-a4d9-b1058bbb0b3d	c9beda63-3d9a-419a-9d35-b59f8303e155	47588633-59e2-4fcb-884b-a005d3f213f1	\N	1	0
1d08a040-ac7c-4406-9835-226fe2f7507f	906ae939-02fb-4ad8-a13c-6915c048ffd4	8c09e87c-a821-49b7-8fac-2d777297312f	\N	2	0
c342eb07-7fde-4a89-a0d8-fdfd3fd2c83c	906ae939-02fb-4ad8-a13c-6915c048ffd4	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	0	0
773b260a-ca12-4033-84dc-3f6292dabd91	6de395d6-6826-49f7-a342-8641f5ae2251	47588633-59e2-4fcb-884b-a005d3f213f1	\N	2	0
0f82054b-0704-4c93-bec9-55c32d0502b4	6de395d6-6826-49f7-a342-8641f5ae2251	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	2	0
77809c54-a106-4786-bf1a-aa2b8fd36f1f	d49f10c0-8c2f-4fb1-bb60-4da3ad9c4ca0	feaf1932-499c-4124-b0cf-cd634ff0dfa1	\N	3	0
be4284dd-f9ef-4d59-8615-4cb279726ef8	d49f10c0-8c2f-4fb1-bb60-4da3ad9c4ca0	dcc024b6-29d4-4050-a28c-61c2cea71088	\N	2	0
\.


--
-- Data for Name: player; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player (id, name, intelligence, defense, attack, mentality, created_at) FROM stdin;
d86ef6af-9c80-4df7-bbf0-4f11590cd8ee	Pedro	82	85	87	86	2025-07-16 20:46:27.381
7773bb49-a637-4068-b55d-b7ccd9629fb3	Cansan	74	68	71	75	2025-07-16 20:46:52.422
feaf1932-499c-4124-b0cf-cd634ff0dfa1	Thiago	84	81	88	80	2025-07-16 20:47:19.647
4345d5cb-cd60-4c72-b5ec-55a6d6a7e85e	Cruz	60	62	65	84	2025-07-16 20:47:41.105
47588633-59e2-4fcb-884b-a005d3f213f1	Leo	98	92	99	72	2025-07-16 20:48:02.32
d1ec07db-b934-4d4d-b393-f310e7fa1e64	Bauer	82	76	74	79	2025-07-16 20:48:28.706
dcc024b6-29d4-4050-a28c-61c2cea71088	Stertz	88	84	84	91	2025-07-16 20:49:13.396
8c09e87c-a821-49b7-8fac-2d777297312f	Ferreira	88	91	97	90	2025-07-16 20:51:28.931
92b8270c-f86a-48bc-88d3-837826b85ad0	Lucas Bauer	88	87	85	86	2025-07-17 01:33:36.379
\.


--
-- Name: _ChampionshipToPlayer _ChampionshipToPlayer_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ChampionshipToPlayer"
    ADD CONSTRAINT "_ChampionshipToPlayer_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: championship_group championship_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.championship_group
    ADD CONSTRAINT championship_group_pkey PRIMARY KEY (id);


--
-- Name: championship championship_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.championship
    ADD CONSTRAINT championship_pkey PRIMARY KEY (id);


--
-- Name: duo duo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.duo
    ADD CONSTRAINT duo_pkey PRIMARY KEY (id);


--
-- Name: group_player group_player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_player
    ADD CONSTRAINT group_player_pkey PRIMARY KEY (id);


--
-- Name: match_participant match_participant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT match_participant_pkey PRIMARY KEY (id);


--
-- Name: match match_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_pkey PRIMARY KEY (id);


--
-- Name: player player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_pkey PRIMARY KEY (id);


--
-- Name: _ChampionshipToPlayer_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_ChampionshipToPlayer_B_index" ON public."_ChampionshipToPlayer" USING btree ("B");


--
-- Name: duo_player_1_id_player_2_id_championship_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX duo_player_1_id_player_2_id_championship_id_key ON public.duo USING btree (player_1_id, player_2_id, championship_id);


--
-- Name: _ChampionshipToPlayer _ChampionshipToPlayer_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ChampionshipToPlayer"
    ADD CONSTRAINT "_ChampionshipToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES public.championship(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ChampionshipToPlayer _ChampionshipToPlayer_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ChampionshipToPlayer"
    ADD CONSTRAINT "_ChampionshipToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES public.player(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: championship championship_duo_winner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.championship
    ADD CONSTRAINT championship_duo_winner_id_fkey FOREIGN KEY (duo_winner_id) REFERENCES public.duo(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: championship_group championship_group_championship_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.championship_group
    ADD CONSTRAINT championship_group_championship_id_fkey FOREIGN KEY (championship_id) REFERENCES public.championship(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: championship championship_winner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.championship
    ADD CONSTRAINT championship_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.player(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: duo duo_championship_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.duo
    ADD CONSTRAINT duo_championship_id_fkey FOREIGN KEY (championship_id) REFERENCES public.championship(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: duo duo_player_1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.duo
    ADD CONSTRAINT duo_player_1_id_fkey FOREIGN KEY (player_1_id) REFERENCES public.player(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: duo duo_player_2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.duo
    ADD CONSTRAINT duo_player_2_id_fkey FOREIGN KEY (player_2_id) REFERENCES public.player(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: group_player group_player_championship_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_player
    ADD CONSTRAINT group_player_championship_group_id_fkey FOREIGN KEY (championship_group_id) REFERENCES public.championship_group(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: group_player group_player_duo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_player
    ADD CONSTRAINT group_player_duo_id_fkey FOREIGN KEY (duo_id) REFERENCES public.duo(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: group_player group_player_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_player
    ADD CONSTRAINT group_player_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.player(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: match match_championship_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_championship_id_fkey FOREIGN KEY (championship_id) REFERENCES public.championship(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: match match_duo_winner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_duo_winner_id_fkey FOREIGN KEY (duo_winner_id) REFERENCES public.duo(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: match_participant match_participant_duo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT match_participant_duo_id_fkey FOREIGN KEY (duo_id) REFERENCES public.duo(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: match_participant match_participant_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT match_participant_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.match(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: match_participant match_participant_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_participant
    ADD CONSTRAINT match_participant_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.player(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: match match_winner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.player(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

