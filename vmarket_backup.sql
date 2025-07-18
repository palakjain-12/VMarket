--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

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
-- Name: ExportRequestStatus; Type: TYPE; Schema: public; Owner: vmarket_user
--

CREATE TYPE public."ExportRequestStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'COMPLETED'
);


ALTER TYPE public."ExportRequestStatus" OWNER TO vmarket_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: vmarket_user
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


ALTER TABLE public._prisma_migrations OWNER TO vmarket_user;

--
-- Name: export_requests; Type: TABLE; Schema: public; Owner: vmarket_user
--

CREATE TABLE public.export_requests (
    id text NOT NULL,
    quantity integer NOT NULL,
    status public."ExportRequestStatus" DEFAULT 'PENDING'::public."ExportRequestStatus" NOT NULL,
    message text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    product_id text NOT NULL,
    from_shop_id text NOT NULL,
    to_shop_id text NOT NULL
);


ALTER TABLE public.export_requests OWNER TO vmarket_user;

--
-- Name: products; Type: TABLE; Schema: public; Owner: vmarket_user
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    expiry_date timestamp(3) without time zone,
    category text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    shopkeeper_id text NOT NULL
);


ALTER TABLE public.products OWNER TO vmarket_user;

--
-- Name: shopkeepers; Type: TABLE; Schema: public; Owner: vmarket_user
--

CREATE TABLE public.shopkeepers (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    phone text,
    shop_name text NOT NULL,
    address text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shopkeepers OWNER TO vmarket_user;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: vmarket_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8da9bfa0-f3b0-4a16-b5a1-0895b47164da	9789ff1fd5fa4f401ca3306f1705f053aa777226ff4436cedc3529bb07df0784	2025-07-16 06:10:26.258224+00	20250710094534_init	\N	\N	2025-07-16 06:10:23.470115+00	1
\.


--
-- Data for Name: export_requests; Type: TABLE DATA; Schema: public; Owner: vmarket_user
--

COPY public.export_requests (id, quantity, status, message, created_at, updated_at, product_id, from_shop_id, to_shop_id) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: vmarket_user
--

COPY public.products (id, name, description, price, quantity, expiry_date, category, created_at, updated_at, shopkeeper_id) FROM stdin;
\.


--
-- Data for Name: shopkeepers; Type: TABLE DATA; Schema: public; Owner: vmarket_user
--

COPY public.shopkeepers (id, email, password, name, phone, shop_name, address, created_at, updated_at) FROM stdin;
cmd5l2wzd0000t601gwlwfkyq	ashish@ok.com	$2b$10$ZJ.0OjmAEolbYs9GJBPGAu/y.DdCNYWS.LwZgVfK9iheWCFmj.Nwu	Ashish		Ashish Enterprise	342, Ambedkar Marg	2025-07-16 06:31:59.346	2025-07-16 06:31:59.346
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: vmarket_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: export_requests export_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: vmarket_user
--

ALTER TABLE ONLY public.export_requests
    ADD CONSTRAINT export_requests_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: vmarket_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: shopkeepers shopkeepers_pkey; Type: CONSTRAINT; Schema: public; Owner: vmarket_user
--

ALTER TABLE ONLY public.shopkeepers
    ADD CONSTRAINT shopkeepers_pkey PRIMARY KEY (id);


--
-- Name: shopkeepers_email_key; Type: INDEX; Schema: public; Owner: vmarket_user
--

CREATE UNIQUE INDEX shopkeepers_email_key ON public.shopkeepers USING btree (email);


--
-- Name: export_requests export_requests_from_shop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vmarket_user
--

ALTER TABLE ONLY public.export_requests
    ADD CONSTRAINT export_requests_from_shop_id_fkey FOREIGN KEY (from_shop_id) REFERENCES public.shopkeepers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: export_requests export_requests_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vmarket_user
--

ALTER TABLE ONLY public.export_requests
    ADD CONSTRAINT export_requests_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: export_requests export_requests_to_shop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vmarket_user
--

ALTER TABLE ONLY public.export_requests
    ADD CONSTRAINT export_requests_to_shop_id_fkey FOREIGN KEY (to_shop_id) REFERENCES public.shopkeepers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_shopkeeper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vmarket_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_shopkeeper_id_fkey FOREIGN KEY (shopkeeper_id) REFERENCES public.shopkeepers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

