SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 6H2s12HrTvWHAdZC3lR7ShEwi49ApwI2Q2CnfCsiTir2M1ZhoCAjluuW2BGA0Dd

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('product-images', 'product-images', NULL, '2026-06-08 08:13:39.230034+00', '2026-06-08 08:13:39.230034+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('avatars', 'avatars', NULL, '2026-06-13 12:22:22.945629+00', '2026-06-13 12:22:22.945629+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('expense-receipts', 'expense-receipts', NULL, '2026-06-18 16:47:38.914181+00', '2026-06-18 16:47:38.914181+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('app-releases', 'app-releases', NULL, '2026-07-05 16:23:54.107404+00', '2026-07-05 16:23:54.107404+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('d328e3e9-38da-4005-9d58-241ad33a4376', 'product-images', 'cv-oror/image_1782999716482.webp', NULL, '2026-07-02 13:41:58.815144+00', '2026-07-02 13:41:58.815144+00', '2026-07-02 13:41:58.815144+00', '{"eTag": "\"3de896f4d777d3aa98666899dd4b54a5\"", "size": 55640, "mimetype": "image/webp", "cacheControl": "max-age=31536000", "lastModified": "2026-07-02T13:41:59.000Z", "contentLength": 55640, "httpStatusCode": 200}', '4731b9f3-4a00-4b4e-a25e-609ca8b6ad4f', NULL, '{}'),
	('742a6b4b-569e-489d-8d8a-6c8ea6cceb8d', 'avatars', '.emptyFolderPlaceholder', NULL, '2026-06-13 13:02:57.421135+00', '2026-06-13 13:02:57.421135+00', '2026-06-13 13:02:57.421135+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T13:02:57.428Z", "contentLength": 0, "httpStatusCode": 200}', '4740aedc-fa51-4017-8579-7ee01bcf56a4', NULL, '{}'),
	('fe695bac-13b4-493f-bfca-7fa4120d933f', 'avatars', 'a15a9e6b-1895-4031-af5d-5bd7e3374f27_1783002425180.webp', NULL, '2026-07-02 14:27:08.38385+00', '2026-07-02 14:27:08.38385+00', '2026-07-02 14:27:08.38385+00', '{"eTag": "\"947de1a85d048c9743d3d5503315db79\"", "size": 8932, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-02T14:27:09.000Z", "contentLength": 8932, "httpStatusCode": 200}', '76f9ee87-14f0-4e0f-8f83-46d55611f2ab', NULL, '{}'),
	('f218365d-2439-44a3-82c0-b4e7bf6527f8', 'app-releases', '.emptyFolderPlaceholder', NULL, '2026-07-05 17:22:07.361094+00', '2026-07-05 17:22:07.361094+00', '2026-07-05 17:22:07.361094+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-07-05T17:22:07.367Z", "contentLength": 0, "httpStatusCode": 200}', '16018a7e-0d73-49de-a1fc-9a0088052fba', NULL, '{}'),
	('3dbd1300-6708-4dbc-baae-e1be45752583', 'app-releases', 'app-release.apk', NULL, '2026-07-05 17:22:15.449279+00', '2026-07-05 17:22:15.449279+00', '2026-07-05 17:22:15.449279+00', '{"eTag": "\"d4e4b49f36a5d74bbedbf6718f109723-1\"", "size": 5491211, "mimetype": "application/vnd.android.package-archive", "cacheControl": "max-age=3600", "lastModified": "2026-07-05T17:22:13.000Z", "contentLength": 5491211, "httpStatusCode": 200}', '6c7aee03-037f-4b3e-98b3-ee68edb7b2a2', NULL, NULL),
	('67274ae3-fa21-4ee6-a33e-6f64107dfde0', 'product-images', 'teh/image_1782997738499.webp', NULL, '2026-07-02 13:09:00.75797+00', '2026-07-02 13:09:00.75797+00', '2026-07-02 13:09:00.75797+00', '{"eTag": "\"240ac29a2a8c21cb9ae7b5f7aa368ad9\"", "size": 31114, "mimetype": "image/webp", "cacheControl": "max-age=31536000", "lastModified": "2026-07-02T13:09:01.000Z", "contentLength": 31114, "httpStatusCode": 200}', '628d4b13-ed27-4f7f-b367-2d01313a4f87', NULL, '{}'),
	('38d494a7-59ca-41c2-b41b-b4ed37af202c', 'product-images', 'masako-rasa-jeruk/image_1783147251648.webp', NULL, '2026-07-04 06:40:53.360067+00', '2026-07-04 06:40:53.360067+00', '2026-07-04 06:40:53.360067+00', '{"eTag": "\"85240497a2264f967426bc8e892c2974\"", "size": 38358, "mimetype": "image/webp", "cacheControl": "max-age=31536000", "lastModified": "2026-07-04T06:40:54.000Z", "contentLength": 38358, "httpStatusCode": 200}', 'd294a347-e22e-4b81-be0e-cd840e800f90', NULL, '{}'),
	('3e0013c8-ebd8-464f-896d-ba86414a6a27', 'app-releases', 'app-release-v1.0.5.apk', NULL, '2026-07-05 17:36:09.444935+00', '2026-07-05 17:38:01.146881+00', '2026-07-05 17:36:09.444935+00', '{"eTag": "\"a1aca2e49641aa2eff12e6d4794f8e4c\"", "size": 5491211, "mimetype": "application/vnd.android.package-archive", "cacheControl": "max-age=3600", "lastModified": "2026-07-05T17:38:02.000Z", "contentLength": 5491211, "httpStatusCode": 200}', 'd0cee132-2dbb-4d76-839d-de94b033e27d', NULL, '{}'),
	('d3ee4cc1-5655-43c8-9bcf-cec582f97553', 'app-releases', 'app-release-v1.0.6.apk', NULL, '2026-07-05 17:48:05.300522+00', '2026-07-05 17:48:05.300522+00', '2026-07-05 17:48:05.300522+00', '{"eTag": "\"6768c61006e358fa282e4e69a109756c\"", "size": 5491215, "mimetype": "application/vnd.android.package-archive", "cacheControl": "max-age=3600", "lastModified": "2026-07-05T17:48:06.000Z", "contentLength": 5491215, "httpStatusCode": 200}', '5b124c5b-4817-4ac3-9350-d4425c79a9a6', NULL, '{}'),
	('cd677528-8b58-4767-980b-5be133d17b30', 'app-releases', 'app-release-v1.0.7.apk', NULL, '2026-07-05 17:53:41.662978+00', '2026-07-05 17:53:41.662978+00', '2026-07-05 17:53:41.662978+00', '{"eTag": "\"10cf3c4d1671368b7202b4b408f99213\"", "size": 5491215, "mimetype": "application/vnd.android.package-archive", "cacheControl": "max-age=3600", "lastModified": "2026-07-05T17:53:42.000Z", "contentLength": 5491215, "httpStatusCode": 200}', '9eb5c7ff-ef0f-4a93-9412-e4df6cd7d84a', NULL, '{}'),
	('62e1e5a2-f6f6-48a1-b94a-28f372ab7eef', 'product-images', 'es-saos/image_1782997764617.webp', NULL, '2026-07-02 13:09:26.430991+00', '2026-07-02 13:09:26.430991+00', '2026-07-02 13:09:26.430991+00', '{"eTag": "\"752568eca27666a2b1cd769671c55277\"", "size": 15034, "mimetype": "image/webp", "cacheControl": "max-age=31536000", "lastModified": "2026-07-02T13:09:27.000Z", "contentLength": 15034, "httpStatusCode": 200}', '5dcd07da-fb81-41e1-b09f-c8c14cdab0eb', NULL, '{}'),
	('f5b5d294-aa8a-458c-bde8-0ef00f97c716', 'expense-receipts', '.emptyFolderPlaceholder', NULL, '2026-07-01 05:59:06.24077+00', '2026-07-01 05:59:06.24077+00', '2026-07-01 05:59:06.24077+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2026-07-01T05:59:06.248Z", "contentLength": 0, "httpStatusCode": 200}', '73191f1a-ad10-4c7d-bf17-4baafcae2ef3', NULL, '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- PostgreSQL database dump complete
--

-- \unrestrict 6H2s12HrTvWHAdZC3lR7ShEwi49ApwI2Q2CnfCsiTir2M1ZhoCAjluuW2BGA0Dd

RESET ALL;
