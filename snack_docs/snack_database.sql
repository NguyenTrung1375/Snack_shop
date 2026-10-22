-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: snack_shop
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chi_tiet_don_hang`
--

DROP TABLE IF EXISTS `chi_tiet_don_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_don_hang` (
  `ma_chi_tiet_don_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_don_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_san_pham` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_luong` int NOT NULL,
  `don_gia` decimal(15,2) NOT NULL,
  `thanh_tien` decimal(15,2) GENERATED ALWAYS AS ((`so_luong` * `don_gia`)) STORED,
  PRIMARY KEY (`ma_chi_tiet_don_hang`),
  UNIQUE KEY `uq_ctdh_don_sp` (`ma_don_hang`,`ma_san_pham`),
  KEY `idx_ctdh_san_pham` (`ma_san_pham`),
  CONSTRAINT `fk_ctdh_don_hang` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE,
  CONSTRAINT `fk_ctdh_san_pham` FOREIGN KEY (`ma_san_pham`) REFERENCES `san_pham` (`ma_san_pham`),
  CONSTRAINT `ck_ctdh_don_gia` CHECK ((`don_gia` >= 0)),
  CONSTRAINT `ck_ctdh_so_luong` CHECK ((`so_luong` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_don_hang`
--

LOCK TABLES `chi_tiet_don_hang` WRITE;
/*!40000 ALTER TABLE `chi_tiet_don_hang` DISABLE KEYS */;
INSERT INTO `chi_tiet_don_hang` (`ma_chi_tiet_don_hang`, `ma_don_hang`, `ma_san_pham`, `so_luong`, `don_gia`) VALUES ('002b62f1-f33a-44f3-a553-0d3653b216de','b06bb0a1-14d1-4133-96ee-e3e4c7eaaea8','a22e8946-0fbf-4ab9-9261-786483d37c7d',2,45000.00),('0381fa06-1920-428a-b93b-653dba382ea3','d55264ea-4e31-4340-8b0a-502379cf77c6','57decd03-37f8-420f-81fb-c6b0a90f5912',2,149000.00),('0597a06d-a180-4776-aa00-d51bcfa0a547','57e63094-6193-4c39-b225-f0d4790adb27','08bf092e-b1d5-4c48-b093-c252f9c8ccb5',2,20000.00),('059a1e6a-f985-4f4f-a155-967ad0cb2397','bcf492d8-4fd3-401c-aab3-0c89b46eb3a5','271f040a-e039-4fbe-ab4e-e4f91e312025',2,40000.00),('0623b38f-ac64-4b4e-8592-977c74c3fbd0','0e9297b8-b8d9-4c73-9a02-e5fd1a2bab4a','7a8363ec-f617-4adb-9ab0-0e84e2144300',1,129000.00),('0789e5e7-94e2-4b82-ac9c-7da5e5142075','d55264ea-4e31-4340-8b0a-502379cf77c6','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',2,99000.00),('0c64ec8d-1515-4514-bf91-31dd66dae58a','556e0a79-027d-45b1-a254-b25c00100ab2','4d6ace7c-8110-41ac-b4b3-7781148a402e',1,49000.00),('11f1e13c-6036-445d-b40a-69b3b1d01f03','a73f5cc1-2ad9-4be0-8a9d-889a2bc99ae6','dd5188b1-d60e-4fee-aea6-c84d54672d21',2,60000.00),('1250c3e3-1189-405c-bf97-73a2857c7215','f3d41f2d-0e62-4fa1-bbbd-b28767d3115e','2f96fde0-8536-43d3-9fb2-b919306cfc1e',2,25000.00),('16d8cdd6-7e64-4b6f-a49f-55a2fa4dcabc','7304b7f6-8e0e-48be-92f1-131d43b49698','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',2,99000.00),('18fadfd6-e8f7-4d77-b452-48a36f235096','d55264ea-4e31-4340-8b0a-502379cf77c6','bda9a98b-1cba-4dcc-bf00-06ca8f736574',2,75000.00),('19e5f553-d0e1-4668-a664-b6edaddb6801','9becdeec-f998-42c7-8489-98ed82605c76','dd5188b1-d60e-4fee-aea6-c84d54672d21',1,60000.00),('1de38595-aeba-4940-b809-6fbff0f2cc84','64ea5ef8-fa06-43ad-9400-85d43a731305','042f1219-748e-4bb0-909b-d9f4ef857534',2,50000.00),('1ea91a30-1efb-4b93-bbf6-5f217710bca2','cb475858-0bd7-46e5-99c3-e38217c4531f','042f1219-748e-4bb0-909b-d9f4ef857534',1,50000.00),('1fb3dcb0-1d7a-4b28-addc-15f8ad9242f0','556e0a79-027d-45b1-a254-b25c00100ab2','271f040a-e039-4fbe-ab4e-e4f91e312025',2,40000.00),('209e3f42-2f2d-4152-8efe-b9a14edf5b20','703885ba-3942-475a-8d0c-873518c57c3d','1895bdfc-2fd3-4e86-a7df-2bc2ab34c792',1,79000.00),('214370e5-73c5-41f5-8be9-261f8d8eb229','57e63094-6193-4c39-b225-f0d4790adb27','7a8363ec-f617-4adb-9ab0-0e84e2144300',1,129000.00),('225e4159-7106-46c5-bed6-b80af73ee37f','57e63094-6193-4c39-b225-f0d4790adb27','a22e8946-0fbf-4ab9-9261-786483d37c7d',2,45000.00),('23915ed6-d5f5-4dfb-b3d5-ac01c795eb87','3742c1c2-99a6-4a30-82a2-5af6ee80427f','57decd03-37f8-420f-81fb-c6b0a90f5912',2,149000.00),('243b33f5-def9-45d1-9b2d-6539993928d3','5b396d0c-f1ce-469d-a7c3-dcf09fe0b696','e9d0f8f6-34ce-4100-bd79-a843c393d086',2,59000.00),('27cdda48-ed8e-432b-8e0f-5d776d4b6555','dee53ecf-2899-4da9-b1f2-b2789520125b','2f96fde0-8536-43d3-9fb2-b919306cfc1e',2,25000.00),('2c15adc6-154a-4773-972e-767b62119a11','f653e0fe-c254-4569-9820-9e545d4595c6','3c9367a9-9a32-495a-bb99-4043d16ee655',2,69000.00),('2e953828-6c3d-4c1d-a14d-df8bbcff814a','38fbe4ff-8095-4faa-92cb-55c7efd7d843','bda9a98b-1cba-4dcc-bf00-06ca8f736574',3,75000.00),('344e5d81-3dc7-4216-bebd-77aa226964c4','862a5a2d-ed3b-41d3-902c-837451ac37e6','17580c91-02cb-4fdb-a35e-0d994923398e',2,79000.00),('3810cbc7-f7bb-48ed-b328-1440234a661c','f653e0fe-c254-4569-9820-9e545d4595c6','276940fd-ae6f-4546-9c47-a704a0ce6171',1,20000.00),('38ac4c7f-23dc-4aed-a7a6-bcfe07babe76','661833b8-56a9-4b84-9cb0-e3702557a9d1','276940fd-ae6f-4546-9c47-a704a0ce6171',10,20000.00),('3c21180d-d55a-4d19-855c-8b70f315a859','3d53f02c-d7ad-4d37-8e3d-95fc19d3e59b','b4d8ea31-3f07-456f-be70-f54add2ad003',2,50000.00),('3cb79541-7c06-44c0-89fd-1ace016f96bb','281bf98b-6dbe-41b5-bf73-4bdba9a669c9','3c9367a9-9a32-495a-bb99-4043d16ee655',2,69000.00),('3cd5e28b-0e85-4fed-a354-c1d3ee18e6f4','f653e0fe-c254-4569-9820-9e545d4595c6','dd5188b1-d60e-4fee-aea6-c84d54672d21',1,60000.00),('3d0cf034-c2b2-4129-aa29-8a83ce9d88a4','f9ad9572-3b1b-40b0-ae77-286a3c2faacc','bda9a98b-1cba-4dcc-bf00-06ca8f736574',1,75000.00),('427dae22-f9a5-4d7c-a6b1-6ee424a93c83','a51ca0ad-bb7a-4c6f-8697-90f3d79e10bc','042f1219-748e-4bb0-909b-d9f4ef857534',2,50000.00),('44492527-ce11-4e3e-97c0-ca3cfdad4f85','3d53f02c-d7ad-4d37-8e3d-95fc19d3e59b','bda9a98b-1cba-4dcc-bf00-06ca8f736574',1,75000.00),('47070c79-1039-4934-be68-30f7dfee5ad6','64c9bad3-77fe-4068-a255-c466904cd8c7','2d5c7720-b613-45cc-8a2a-8682bc56d18e',2,89000.00),('493a6e40-9119-4db9-94fb-dd531297b4b6','efdd75e0-0a9e-4a77-8ea5-d46c7fbcf69a','b4d8ea31-3f07-456f-be70-f54add2ad003',2,50000.00),('49cc633c-2ef2-4ce9-847b-371652444ae5','b06bb0a1-14d1-4133-96ee-e3e4c7eaaea8','2f96fde0-8536-43d3-9fb2-b919306cfc1e',1,25000.00),('4edddac4-a5f0-470f-86e1-e44539f41f02','94a98a18-8d82-4109-8cfa-5663eca25348','bda9a98b-1cba-4dcc-bf00-06ca8f736574',5,75000.00),('4f3747fc-3309-4bdf-b3c5-c070cb4505b1','03d43a95-27d0-4f7e-846d-f2e409e55da5','042f1219-748e-4bb0-909b-d9f4ef857534',2,50000.00),('5039a1c2-7860-4792-9b70-602e5aa974b0','41a92d29-5796-4e34-bad0-8af5cf0e0495','19602eff-6304-43e2-8bb8-b1c09dbb17a7',2,29000.00),('51d19e54-1095-4b7e-8724-118bcaf17338','fa129f7e-3b02-4ada-8148-2125c705189d','dd5188b1-d60e-4fee-aea6-c84d54672d21',2,60000.00),('55abbf1c-1a43-4e2d-8a7a-547f1fcea3c4','a73f5cc1-2ad9-4be0-8a9d-889a2bc99ae6','1895bdfc-2fd3-4e86-a7df-2bc2ab34c792',1,79000.00),('56698946-80ae-4346-ac33-7658d07f2944','0175c089-698d-452b-9e08-cdae723815ce','4d6ace7c-8110-41ac-b4b3-7781148a402e',2,49000.00),('57dbf4b6-fc71-41d3-ad00-73082a965622','3d53f02c-d7ad-4d37-8e3d-95fc19d3e59b','7a8363ec-f617-4adb-9ab0-0e84e2144300',2,129000.00),('581345de-00e8-412e-8695-a98ad1d6fe66','b6548e86-eb64-4d30-bd51-9502110f202d','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',2,99000.00),('58979cf4-4e89-407a-9275-e5b4ae52849a','23ca14f9-ee68-4df3-80f8-46f5cd26bf7a','2d5c7720-b613-45cc-8a2a-8682bc56d18e',2,89000.00),('5c573774-eddb-46c1-a484-5b5bdc32ada8','9becdeec-f998-42c7-8489-98ed82605c76','4d6ace7c-8110-41ac-b4b3-7781148a402e',2,49000.00),('60b6de99-c618-40ea-978b-93e8caeaec04','703885ba-3942-475a-8d0c-873518c57c3d','7a8363ec-f617-4adb-9ab0-0e84e2144300',1,129000.00),('633abb59-a177-43db-b187-3e76d76f4947','6126d4b3-d48b-457d-bf94-04a3ada05644','271f040a-e039-4fbe-ab4e-e4f91e312025',2,40000.00),('651ac262-65dc-406b-a87d-c41a1c861bab','b5ee2e47-1c9d-4a3d-976b-34b4d87af4a8','2f96fde0-8536-43d3-9fb2-b919306cfc1e',1,25000.00),('65542c17-eba3-4e1b-9de6-e11469fb0864','d75b0681-d3f0-46a1-8dde-e34564518ca9','271f040a-e039-4fbe-ab4e-e4f91e312025',2,40000.00),('6a402a99-daa9-4701-b6d6-36d507b7ced5','04bf9134-4e6c-4265-923a-6e9731bfd38a','4d6ace7c-8110-41ac-b4b3-7781148a402e',1,49000.00),('6ae5763a-3444-44f7-8aeb-4f18cd31e0f7','74a078b9-594a-4bbc-9b40-f8259a06136c','7a8363ec-f617-4adb-9ab0-0e84e2144300',2,129000.00),('6b11d1ad-9e03-4097-80c5-e6b8d96ca93a','0175c089-698d-452b-9e08-cdae723815ce','cdda2fe7-b650-494e-80f8-90f252f365bc',2,20000.00),('6bf2b6cf-e6d9-4f54-897d-423b7f49c791','1592bb81-b859-40e0-a558-cd0cbd71748a','c7fb4e4f-ca24-4d60-b346-936babbf1e1d',5,185000.00),('6e1437ad-09f5-426b-bfa1-724fd489cef8','03d43a95-27d0-4f7e-846d-f2e409e55da5','4d6ace7c-8110-41ac-b4b3-7781148a402e',1,49000.00),('6ea780ec-c2c4-4cfe-8d3d-dcce4f66b6b1','efdd75e0-0a9e-4a77-8ea5-d46c7fbcf69a','dd5188b1-d60e-4fee-aea6-c84d54672d21',1,60000.00),('6f7a4478-9e00-47fd-ba41-357cdbd214cd','2a9d9ed7-3522-43ee-b973-83c3bbe77411','19602eff-6304-43e2-8bb8-b1c09dbb17a7',2,29000.00),('70830748-179c-4afc-beb2-98a237239a1e','0e9297b8-b8d9-4c73-9a02-e5fd1a2bab4a','276940fd-ae6f-4546-9c47-a704a0ce6171',2,20000.00),('750d863e-bc8d-4228-abf1-606739099500','b0ac8864-1934-4c83-8b44-fba37ff6faf4','448e3647-63f8-4351-a709-6f03e704ea82',2,25000.00),('7a3c1824-69ab-44ad-9d38-12ec1b40153b','64ea5ef8-fa06-43ad-9400-85d43a731305','1895bdfc-2fd3-4e86-a7df-2bc2ab34c792',1,79000.00),('7b5606c5-84a5-4043-a02c-0a7172df6c56','7f46b43c-dca1-4bca-b10f-320b12eda032','448e3647-63f8-4351-a709-6f03e704ea82',2,25000.00),('8242aaf6-9788-49e6-8353-27dd18443277','f9ad9572-3b1b-40b0-ae77-286a3c2faacc','448e3647-63f8-4351-a709-6f03e704ea82',2,25000.00),('83e74f03-a09f-4eab-b4ce-d6225ae70617','64c9bad3-77fe-4068-a255-c466904cd8c7','276940fd-ae6f-4546-9c47-a704a0ce6171',1,20000.00),('84b05878-ceb5-431c-bcbc-f31b7e069b14','5f22c76f-45d1-4c1d-a135-91c93ec235a9','1895bdfc-2fd3-4e86-a7df-2bc2ab34c792',1,79000.00),('869c8eaf-df69-4410-bd01-bba293a906ec','7304b7f6-8e0e-48be-92f1-131d43b49698','2d5c7720-b613-45cc-8a2a-8682bc56d18e',1,89000.00),('869fd0bc-efc2-4e20-9076-9a6581a09532','1592bb81-b859-40e0-a558-cd0cbd71748a','276940fd-ae6f-4546-9c47-a704a0ce6171',1,20000.00),('86cbb9ca-baa3-44df-8821-7534ec712005','b6548e86-eb64-4d30-bd51-9502110f202d','2f96fde0-8536-43d3-9fb2-b919306cfc1e',1,25000.00),('86dfceee-b79d-4a2e-8196-3e73c672ab88','b06bb0a1-14d1-4133-96ee-e3e4c7eaaea8','7a8363ec-f617-4adb-9ab0-0e84e2144300',2,129000.00),('86fa6cf5-bf23-4cae-9b8b-c84f2d2e701d','7bbf10d4-2f41-40c2-80f8-988423a01641','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',1,99000.00),('87a4c35d-8055-495f-8a38-8fe322066e9c','cb475858-0bd7-46e5-99c3-e38217c4531f','7a8363ec-f617-4adb-9ab0-0e84e2144300',2,129000.00),('88c1233e-8a97-416f-a36c-9c682639e232','a94acd00-cff7-414a-828f-42d5f552e5b5','209e287e-f0a3-4105-b5d3-cbb7014f41f8',2,55000.00),('90baa622-9bba-4bfc-988a-d7714e1e0d42','6126d4b3-d48b-457d-bf94-04a3ada05644','b4d8ea31-3f07-456f-be70-f54add2ad003',1,50000.00),('92a14d7d-c13b-4686-ab20-d1d913385d4b','15fda10f-e9cc-4ad6-a41a-02afd24263cc','cdda2fe7-b650-494e-80f8-90f252f365bc',2,20000.00),('946544d1-28af-4e84-be50-b607ee6e88cf','e06d1b83-64dc-4649-8490-9ad937149052','042f1219-748e-4bb0-909b-d9f4ef857534',2,50000.00),('9925d9b3-8db4-4868-b115-3b00844a35c8','7d735118-af33-497f-9b52-e364b5af31eb','2f96fde0-8536-43d3-9fb2-b919306cfc1e',2,25000.00),('a00e30f9-3597-43a9-8cfe-8aa28c2cd480','4442fa15-185d-40d1-9125-4578f685e3b1','a22e8946-0fbf-4ab9-9261-786483d37c7d',1,45000.00),('a26deb2e-5dab-45ab-adc1-73b8364c1a42','fa129f7e-3b02-4ada-8148-2125c705189d','9d886a7f-1355-4edb-98eb-7244c9042c28',4,160000.00),('a372280f-aa70-42cd-a89e-cf5f527de0c8','e06d1b83-64dc-4649-8490-9ad937149052','bda9a98b-1cba-4dcc-bf00-06ca8f736574',2,75000.00),('a6e0ca60-fed1-4c7e-98fa-fc391e6ce963','23ca14f9-ee68-4df3-80f8-46f5cd26bf7a','7a8363ec-f617-4adb-9ab0-0e84e2144300',2,129000.00),('a93fa25a-8c85-4621-adaa-5df84d4fcb63','74a078b9-594a-4bbc-9b40-f8259a06136c','042f1219-748e-4bb0-909b-d9f4ef857534',2,50000.00),('aaa62d34-97ba-4699-bcc4-226504efdb0c','6126d4b3-d48b-457d-bf94-04a3ada05644','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',2,99000.00),('aea17a90-e008-4843-b72b-f770699c5bff','7d735118-af33-497f-9b52-e364b5af31eb','7a8363ec-f617-4adb-9ab0-0e84e2144300',1,129000.00),('af694959-61e9-41ad-9741-3b196e36851d','64c9bad3-77fe-4068-a255-c466904cd8c7','209e287e-f0a3-4105-b5d3-cbb7014f41f8',2,55000.00),('b302d356-515b-4ad7-bcf9-218020bf7575','703885ba-3942-475a-8d0c-873518c57c3d','3c9367a9-9a32-495a-bb99-4043d16ee655',2,69000.00),('b32123ee-4a18-4644-a3be-e018ea9c4e93','d75b0681-d3f0-46a1-8dde-e34564518ca9','448e3647-63f8-4351-a709-6f03e704ea82',1,25000.00),('b37f72f2-6ea7-4047-bd0a-12bce101c16c','862a5a2d-ed3b-41d3-902c-837451ac37e6','dd5188b1-d60e-4fee-aea6-c84d54672d21',1,60000.00),('b8b509a4-c028-41d6-a224-40309d8f4788','0be234e0-8b59-4cce-9274-f288278547c9','bda9a98b-1cba-4dcc-bf00-06ca8f736574',2,75000.00),('ba45504b-91e1-41ad-a958-a2ab3567a7d5','f9ad9572-3b1b-40b0-ae77-286a3c2faacc','042f1219-748e-4bb0-909b-d9f4ef857534',2,50000.00),('bd37a516-043a-487d-9f72-b6298db37c9e','04bf9134-4e6c-4265-923a-6e9731bfd38a','448e3647-63f8-4351-a709-6f03e704ea82',1,25000.00),('c28a737b-65aa-40fa-b022-81c716201b7c','dee53ecf-2899-4da9-b1f2-b2789520125b','4d6ace7c-8110-41ac-b4b3-7781148a402e',1,49000.00),('c2b79ddb-a783-4950-8810-5ff0a7da4188','556e0a79-027d-45b1-a254-b25c00100ab2','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',1,99000.00),('c2e767fa-260b-42b2-96c8-9db37c31cfe2','efdd75e0-0a9e-4a77-8ea5-d46c7fbcf69a','7a8363ec-f617-4adb-9ab0-0e84e2144300',2,129000.00),('c71cf264-7b47-41d1-a615-786f92c07373','d329f874-e60e-4b50-a112-00d8d2653517','7a8363ec-f617-4adb-9ab0-0e84e2144300',2,129000.00),('c7b63ca2-2357-430d-ac97-c2c9bd01a5a5','67e94fdb-bb64-4595-9315-76c94e4d1754','17580c91-02cb-4fdb-a35e-0d994923398e',1,79000.00),('c86514da-3b8f-4b36-a4e8-0797ef06359f','13a7b7b1-f6cd-48df-be1e-8eb91fbbffb1','bda9a98b-1cba-4dcc-bf00-06ca8f736574',1,75000.00),('c8973f5b-199c-491a-99a1-57ae823106a9','5f22c76f-45d1-4c1d-a135-91c93ec235a9','2d5c7720-b613-45cc-8a2a-8682bc56d18e',1,89000.00),('c8fef012-1814-4119-a3c4-b248a2e4243b','281bf98b-6dbe-41b5-bf73-4bdba9a669c9','cdda2fe7-b650-494e-80f8-90f252f365bc',1,20000.00),('c9607d01-5fe6-4e9c-b871-3bdb859feed1','10f4e282-6cba-4220-91e1-469c182894c6','276940fd-ae6f-4546-9c47-a704a0ce6171',10,20000.00),('cb921839-37a1-4721-9b1d-6c3fb81075c0','0be234e0-8b59-4cce-9274-f288278547c9','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',2,99000.00),('d0c99bf5-bffe-4d1c-94a4-3626e548cecb','fa129f7e-3b02-4ada-8148-2125c705189d','2490aaa4-6273-42dd-8298-a57e57e477b8',2,240000.00),('d2476a92-800f-47b2-8ce9-1ca7b8818459','281bf98b-6dbe-41b5-bf73-4bdba9a669c9','276940fd-ae6f-4546-9c47-a704a0ce6171',1,20000.00),('d2fe490f-ecbf-4522-9cb1-19b44842d732','d75b0681-d3f0-46a1-8dde-e34564518ca9','bda9a98b-1cba-4dcc-bf00-06ca8f736574',2,75000.00),('d47fb3ac-2fe9-4140-b25e-ca9e498fcbfe','dc6a9e11-ecc0-410e-88b0-79830f613dcf','209e287e-f0a3-4105-b5d3-cbb7014f41f8',2,55000.00),('d5e4670f-3ef3-4aa2-9670-415c9ca04a11','67e94fdb-bb64-4595-9315-76c94e4d1754','a22e8946-0fbf-4ab9-9261-786483d37c7d',2,45000.00),('d805e8d1-cae3-4413-b4ac-50ad9f34bd57','fa129f7e-3b02-4ada-8148-2125c705189d','d9926ce9-8bc8-4a49-add5-dc17d8248df6',5,135000.00),('d9ffb38c-d57b-44dc-96ce-a3439ed5f119','67e94fdb-bb64-4595-9315-76c94e4d1754','4d6ace7c-8110-41ac-b4b3-7781148a402e',1,49000.00),('dab94fbf-9f85-41ac-9ef8-06a72e14aef7','b5ee2e47-1c9d-4a3d-976b-34b4d87af4a8','448e3647-63f8-4351-a709-6f03e704ea82',1,25000.00),('daf8ee5c-ef4f-4a7c-a572-7c4256f6f187','15fda10f-e9cc-4ad6-a41a-02afd24263cc','b4d8ea31-3f07-456f-be70-f54add2ad003',2,50000.00),('dfc68e85-2c3f-4959-995f-e6758a9bd15e','23ca14f9-ee68-4df3-80f8-46f5cd26bf7a','dd5188b1-d60e-4fee-aea6-c84d54672d21',2,60000.00),('e0d08d9c-5afe-42df-961b-d86a5a1b5e6c','7bbf10d4-2f41-40c2-80f8-988423a01641','2d5c7720-b613-45cc-8a2a-8682bc56d18e',2,89000.00),('e14e9e39-37b9-4d3e-af8f-9c25bdc71acd','2ee02347-a23a-4051-8cb0-b61055d26c86','042f1219-748e-4bb0-909b-d9f4ef857534',1,50000.00),('e5ba3326-c4b2-469a-9a40-bf003e2ad03f','d695c9f9-8d33-4614-a01b-130a6852f153','2490aaa4-6273-42dd-8298-a57e57e477b8',8,240000.00),('e6505d8a-a95d-42f1-8d4e-df7d32702403','41a92d29-5796-4e34-bad0-8af5cf0e0495','209e287e-f0a3-4105-b5d3-cbb7014f41f8',1,55000.00),('e66982e8-f0d3-4f71-a4fd-a5a0239e3ef9','bfe5336a-fdb7-4bf7-b99d-e730284d57e7','17580c91-02cb-4fdb-a35e-0d994923398e',2,79000.00),('e6cc6120-abec-4373-b27d-037635ac747a','13a7b7b1-f6cd-48df-be1e-8eb91fbbffb1','209e287e-f0a3-4105-b5d3-cbb7014f41f8',2,55000.00),('e7913c1b-491d-4edc-ab63-d0579a70f47a','04bf9134-4e6c-4265-923a-6e9731bfd38a','042f1219-748e-4bb0-909b-d9f4ef857534',2,50000.00),('e8807f53-64b0-40cd-b68f-7bbe9007f4ad','dee53ecf-2899-4da9-b1f2-b2789520125b','3c9367a9-9a32-495a-bb99-4043d16ee655',2,69000.00),('e8c0bd9e-0d1d-48aa-8f65-56a6433bb4c3','0175c089-698d-452b-9e08-cdae723815ce','276940fd-ae6f-4546-9c47-a704a0ce6171',1,20000.00),('ec9c5d48-b2c9-4f1b-a7af-4dfaabe1eeae','b6548e86-eb64-4d30-bd51-9502110f202d','bda9a98b-1cba-4dcc-bf00-06ca8f736574',2,75000.00),('ede13928-c986-46a6-83a6-f0e4490338c2','8d50ea8b-9b8d-4df4-a067-5419091369a9','2490aaa4-6273-42dd-8298-a57e57e477b8',3,240000.00),('ee8efb0c-a932-46e7-9a79-3e8195192e5e','03d43a95-27d0-4f7e-846d-f2e409e55da5','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',2,99000.00),('f01a8794-b9e5-4121-b651-59669135af3b','f3d41f2d-0e62-4fa1-bbbd-b28767d3115e','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',1,99000.00),('f1e09afa-057d-4515-8b44-fccd8872531d','dc6a9e11-ecc0-410e-88b0-79830f613dcf','cdda2fe7-b650-494e-80f8-90f252f365bc',1,20000.00),('f4cf5e26-a324-4279-b220-7275293c1937','a94acd00-cff7-414a-828f-42d5f552e5b5','7a8363ec-f617-4adb-9ab0-0e84e2144300',1,129000.00),('f969fb25-6022-41e9-a80d-faf4e3edac68','fa129f7e-3b02-4ada-8148-2125c705189d','1a3dc39b-bccc-463e-a493-cb5a32b371f9',5,580000.00),('fd005dc7-5f30-418a-9b37-697cd98678f8','f3d41f2d-0e62-4fa1-bbbd-b28767d3115e','b4d8ea31-3f07-456f-be70-f54add2ad003',1,50000.00),('ff5841bc-ce57-4497-885e-bfa4aec33331','5b396d0c-f1ce-469d-a7c3-dcf09fe0b696','7a8363ec-f617-4adb-9ab0-0e84e2144300',1,129000.00);
/*!40000 ALTER TABLE `chi_tiet_don_hang` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ctdh_bi` BEFORE INSERT ON `chi_tiet_don_hang` FOR EACH ROW BEGIN
    DECLARE v_ton INT DEFAULT NULL;

    SELECT so_luong_ton INTO v_ton FROM san_pham WHERE ma_san_pham = NEW.ma_san_pham;

    IF v_ton IS NULL OR v_ton < NEW.so_luong THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không đủ tồn kho cho sản phẩm được đặt';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ctdh_ai` AFTER INSERT ON `chi_tiet_don_hang` FOR EACH ROW BEGIN
    UPDATE san_pham
       SET so_luong_ton = so_luong_ton - NEW.so_luong
     WHERE ma_san_pham = NEW.ma_san_pham;

    UPDATE don_hang
       SET tien_hang = (SELECT COALESCE(SUM(thanh_tien), 0)
                          FROM chi_tiet_don_hang
                         WHERE ma_don_hang = NEW.ma_don_hang)
     WHERE ma_don_hang = NEW.ma_don_hang;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ctdh_bu` BEFORE UPDATE ON `chi_tiet_don_hang` FOR EACH ROW BEGIN
    DECLARE v_ton INT DEFAULT NULL;

    SELECT so_luong_ton INTO v_ton FROM san_pham WHERE ma_san_pham = NEW.ma_san_pham;

    -- Cùng sản phẩm: số lượng cũ đang được giữ chỗ nên cộng lại khi kiểm tra
    IF v_ton IS NOT NULL AND OLD.ma_san_pham = NEW.ma_san_pham THEN
        SET v_ton = v_ton + OLD.so_luong;
    END IF;

    IF v_ton IS NULL OR v_ton < NEW.so_luong THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không đủ tồn kho cho sản phẩm được đặt';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ctdh_au` AFTER UPDATE ON `chi_tiet_don_hang` FOR EACH ROW BEGIN
    UPDATE san_pham SET so_luong_ton = so_luong_ton + OLD.so_luong WHERE ma_san_pham = OLD.ma_san_pham;
    UPDATE san_pham SET so_luong_ton = so_luong_ton - NEW.so_luong WHERE ma_san_pham = NEW.ma_san_pham;

    UPDATE don_hang
       SET tien_hang = (SELECT COALESCE(SUM(thanh_tien), 0)
                          FROM chi_tiet_don_hang
                         WHERE ma_don_hang = NEW.ma_don_hang)
     WHERE ma_don_hang = NEW.ma_don_hang;

    IF OLD.ma_don_hang <> NEW.ma_don_hang THEN
        UPDATE don_hang
           SET tien_hang = (SELECT COALESCE(SUM(thanh_tien), 0)
                              FROM chi_tiet_don_hang
                             WHERE ma_don_hang = OLD.ma_don_hang)
         WHERE ma_don_hang = OLD.ma_don_hang;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ctdh_ad` AFTER DELETE ON `chi_tiet_don_hang` FOR EACH ROW BEGIN
    UPDATE san_pham
       SET so_luong_ton = so_luong_ton + OLD.so_luong
     WHERE ma_san_pham = OLD.ma_san_pham;

    UPDATE don_hang
       SET tien_hang = (SELECT COALESCE(SUM(thanh_tien), 0)
                          FROM chi_tiet_don_hang
                         WHERE ma_don_hang = OLD.ma_don_hang)
     WHERE ma_don_hang = OLD.ma_don_hang;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `chi_tiet_gio_hang`
--

DROP TABLE IF EXISTS `chi_tiet_gio_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_gio_hang` (
  `ma_gio_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_khach_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_san_pham` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_luong` int NOT NULL DEFAULT '1',
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_gio_hang`),
  UNIQUE KEY `uq_gio_hang_kh_sp` (`ma_khach_hang`,`ma_san_pham`),
  KEY `idx_gio_hang_sp` (`ma_san_pham`),
  CONSTRAINT `fk_gio_hang_kh` FOREIGN KEY (`ma_khach_hang`) REFERENCES `khach_hang` (`ma_nguoi_dung`) ON DELETE CASCADE,
  CONSTRAINT `fk_gio_hang_sp` FOREIGN KEY (`ma_san_pham`) REFERENCES `san_pham` (`ma_san_pham`) ON DELETE CASCADE,
  CONSTRAINT `ck_gio_hang_sl` CHECK ((`so_luong` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_gio_hang`
--

LOCK TABLES `chi_tiet_gio_hang` WRITE;
/*!40000 ALTER TABLE `chi_tiet_gio_hang` DISABLE KEYS */;
INSERT INTO `chi_tiet_gio_hang` VALUES ('b7c6404b-19ec-4722-a696-069635a7b7df','4fe3aeb0-293d-44dc-a09f-bdcbaa8967ac','271f040a-e039-4fbe-ab4e-e4f91e312025',2,'2026-10-15 01:12:41');
/*!40000 ALTER TABLE `chi_tiet_gio_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_nhap_hang`
--

DROP TABLE IF EXISTS `chi_tiet_nhap_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_nhap_hang` (
  `ma_don_nhap` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_san_pham` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_luong` int NOT NULL,
  `gia_nhap` decimal(15,2) NOT NULL,
  `thanh_tien` decimal(15,2) GENERATED ALWAYS AS ((`so_luong` * `gia_nhap`)) STORED,
  PRIMARY KEY (`ma_don_nhap`,`ma_san_pham`),
  KEY `idx_ctnh_san_pham` (`ma_san_pham`),
  CONSTRAINT `fk_ctnh_don_nhap` FOREIGN KEY (`ma_don_nhap`) REFERENCES `don_nhap_hang` (`ma_don_nhap`) ON DELETE CASCADE,
  CONSTRAINT `fk_ctnh_san_pham` FOREIGN KEY (`ma_san_pham`) REFERENCES `san_pham` (`ma_san_pham`),
  CONSTRAINT `ck_ctnh_gia` CHECK ((`gia_nhap` >= 0)),
  CONSTRAINT `ck_ctnh_so_luong` CHECK ((`so_luong` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_nhap_hang`
--

LOCK TABLES `chi_tiet_nhap_hang` WRITE;
/*!40000 ALTER TABLE `chi_tiet_nhap_hang` DISABLE KEYS */;
INSERT INTO `chi_tiet_nhap_hang` (`ma_don_nhap`, `ma_san_pham`, `so_luong`, `gia_nhap`) VALUES ('23bf871c-155f-42ec-a1ce-fc0610711b91','096cda99-6f3f-45b0-8a15-50b98f9f316c',100,80000.00),('23bf871c-155f-42ec-a1ce-fc0610711b91','b01fb178-3ccc-405e-9ffc-77714e749857',100,35000.00),('23bf871c-155f-42ec-a1ce-fc0610711b91','ed20534a-a811-4ea2-bf2a-b67c32a34bd8',100,20000.00),('275819d2-1c61-4ece-8e65-9aa2a5dd589d','1a3dc39b-bccc-463e-a493-cb5a32b371f9',100,260000.00),('275819d2-1c61-4ece-8e65-9aa2a5dd589d','2490aaa4-6273-42dd-8298-a57e57e477b8',100,80000.00),('275819d2-1c61-4ece-8e65-9aa2a5dd589d','c30aacce-3aff-4f10-9286-029ff0e5a13e',100,50000.00),('275819d2-1c61-4ece-8e65-9aa2a5dd589d','cbb3a4ea-7cfc-4eaa-b5c4-c499e380705c',100,150000.00),('2926d9aa-c7a6-4ca1-9483-4752fdcf2e1e','042f1219-748e-4bb0-909b-d9f4ef857534',100,35000.00),('2926d9aa-c7a6-4ca1-9483-4752fdcf2e1e','5896494e-9b3f-456b-94c9-94286793c248',100,40000.00),('2926d9aa-c7a6-4ca1-9483-4752fdcf2e1e','8bb63156-7706-4f2f-804e-45f006afe548',100,65000.00),('2926d9aa-c7a6-4ca1-9483-4752fdcf2e1e','9d886a7f-1355-4edb-98eb-7244c9042c28',100,110000.00),('2926d9aa-c7a6-4ca1-9483-4752fdcf2e1e','c270ec91-4476-4f4c-9dc3-7dea27263d2d',100,120000.00),('2926d9aa-c7a6-4ca1-9483-4752fdcf2e1e','d9926ce9-8bc8-4a49-add5-dc17d8248df6',100,75000.00),('65648307-39ca-46ae-8064-a9c0cf944067','042f1219-748e-4bb0-909b-d9f4ef857534',100,30000.00),('65648307-39ca-46ae-8064-a9c0cf944067','08bf092e-b1d5-4c48-b093-c252f9c8ccb5',100,12000.00),('65648307-39ca-46ae-8064-a9c0cf944067','096cda99-6f3f-45b0-8a15-50b98f9f316c',100,201000.00),('65648307-39ca-46ae-8064-a9c0cf944067','0be6905f-fb99-4da7-9fdb-f1d95e5d343a',100,45000.00),('65648307-39ca-46ae-8064-a9c0cf944067','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',100,59400.00),('65648307-39ca-46ae-8064-a9c0cf944067','138755a4-1234-44aa-a175-9d981658d30b',100,57000.00),('65648307-39ca-46ae-8064-a9c0cf944067','17580c91-02cb-4fdb-a35e-0d994923398e',100,47400.00),('65648307-39ca-46ae-8064-a9c0cf944067','1895bdfc-2fd3-4e86-a7df-2bc2ab34c792',100,47400.00),('65648307-39ca-46ae-8064-a9c0cf944067','19602eff-6304-43e2-8bb8-b1c09dbb17a7',100,17400.00),('65648307-39ca-46ae-8064-a9c0cf944067','1a3dc39b-bccc-463e-a493-cb5a32b371f9',100,348000.00),('65648307-39ca-46ae-8064-a9c0cf944067','1c96210f-aa89-4e0c-a1d8-0d3d0d799e1a',100,102000.00),('65648307-39ca-46ae-8064-a9c0cf944067','209e287e-f0a3-4105-b5d3-cbb7014f41f8',100,33000.00),('65648307-39ca-46ae-8064-a9c0cf944067','2490aaa4-6273-42dd-8298-a57e57e477b8',100,144000.00),('65648307-39ca-46ae-8064-a9c0cf944067','271f040a-e039-4fbe-ab4e-e4f91e312025',100,24000.00),('65648307-39ca-46ae-8064-a9c0cf944067','276940fd-ae6f-4546-9c47-a704a0ce6171',100,12000.00),('65648307-39ca-46ae-8064-a9c0cf944067','2b22bedd-5397-414e-b2f7-1b104baea21c',100,167400.00),('65648307-39ca-46ae-8064-a9c0cf944067','2b9f9d85-7a53-41ef-b395-4fe78a5777d8',100,144000.00),('65648307-39ca-46ae-8064-a9c0cf944067','2d5c7720-b613-45cc-8a2a-8682bc56d18e',100,53400.00),('65648307-39ca-46ae-8064-a9c0cf944067','2f6ab4b0-7c2f-4bf1-99b5-38fd42e8bdf3',100,102000.00),('65648307-39ca-46ae-8064-a9c0cf944067','2f96fde0-8536-43d3-9fb2-b919306cfc1e',100,15000.00),('65648307-39ca-46ae-8064-a9c0cf944067','3c090b57-c4f3-4b29-96e1-e36d1482e23a',100,99000.00),('65648307-39ca-46ae-8064-a9c0cf944067','3c9367a9-9a32-495a-bb99-4043d16ee655',100,41400.00),('65648307-39ca-46ae-8064-a9c0cf944067','448e3647-63f8-4351-a709-6f03e704ea82',100,15000.00),('65648307-39ca-46ae-8064-a9c0cf944067','4d6ace7c-8110-41ac-b4b3-7781148a402e',100,29400.00),('65648307-39ca-46ae-8064-a9c0cf944067','57decd03-37f8-420f-81fb-c6b0a90f5912',100,89400.00),('65648307-39ca-46ae-8064-a9c0cf944067','5896494e-9b3f-456b-94c9-94286793c248',100,42000.00),('65648307-39ca-46ae-8064-a9c0cf944067','5f382eca-09f0-4ad4-9dd8-7816559b4d8d',100,131400.00),('65648307-39ca-46ae-8064-a9c0cf944067','6d75dd70-2f32-4e15-b1b5-4977a9a907ea',100,66000.00),('65648307-39ca-46ae-8064-a9c0cf944067','7a8363ec-f617-4adb-9ab0-0e84e2144300',100,77400.00),('65648307-39ca-46ae-8064-a9c0cf944067','8bb63156-7706-4f2f-804e-45f006afe548',100,57000.00),('65648307-39ca-46ae-8064-a9c0cf944067','9997339f-7e3c-432c-9921-f48180c671cb',100,114000.00),('65648307-39ca-46ae-8064-a9c0cf944067','9d886a7f-1355-4edb-98eb-7244c9042c28',100,96000.00),('65648307-39ca-46ae-8064-a9c0cf944067','a22e8946-0fbf-4ab9-9261-786483d37c7d',100,27000.00),('65648307-39ca-46ae-8064-a9c0cf944067','ac2237e0-5ac2-4c3d-aa35-c37b1fbdc8c7',100,258000.00),('65648307-39ca-46ae-8064-a9c0cf944067','b01fb178-3ccc-405e-9ffc-77714e749857',100,39000.00),('65648307-39ca-46ae-8064-a9c0cf944067','b4d8ea31-3f07-456f-be70-f54add2ad003',100,30000.00),('65648307-39ca-46ae-8064-a9c0cf944067','bd7f629e-4daa-4ede-8814-b7de0c614c0b',100,143400.00),('65648307-39ca-46ae-8064-a9c0cf944067','bda9a98b-1cba-4dcc-bf00-06ca8f736574',100,45000.00),('65648307-39ca-46ae-8064-a9c0cf944067','beace8e4-911e-419b-9fb0-574e920c5617',100,113400.00),('65648307-39ca-46ae-8064-a9c0cf944067','c270ec91-4476-4f4c-9dc3-7dea27263d2d',100,132000.00),('65648307-39ca-46ae-8064-a9c0cf944067','c30aacce-3aff-4f10-9286-029ff0e5a13e',100,87000.00),('65648307-39ca-46ae-8064-a9c0cf944067','c7fb4e4f-ca24-4d60-b346-936babbf1e1d',100,111000.00),('65648307-39ca-46ae-8064-a9c0cf944067','c98553b6-c724-432a-86d9-0221ba4cf428',100,45000.00),('65648307-39ca-46ae-8064-a9c0cf944067','cbb3a4ea-7cfc-4eaa-b5c4-c499e380705c',100,204000.00),('65648307-39ca-46ae-8064-a9c0cf944067','cdda2fe7-b650-494e-80f8-90f252f365bc',100,12000.00),('65648307-39ca-46ae-8064-a9c0cf944067','d8bb42e2-bbd2-4f90-838f-eb5fc4d382c0',100,57000.00),('65648307-39ca-46ae-8064-a9c0cf944067','d9926ce9-8bc8-4a49-add5-dc17d8248df6',100,81000.00),('65648307-39ca-46ae-8064-a9c0cf944067','dd5188b1-d60e-4fee-aea6-c84d54672d21',100,36000.00),('65648307-39ca-46ae-8064-a9c0cf944067','de36ff01-0bc9-4cff-ab65-e2e0bae110ee',100,125400.00),('65648307-39ca-46ae-8064-a9c0cf944067','e7aeb13d-75e8-4e22-beec-7649135ab23b',100,125400.00),('65648307-39ca-46ae-8064-a9c0cf944067','e9d0f8f6-34ce-4100-bd79-a843c393d086',100,35400.00),('65648307-39ca-46ae-8064-a9c0cf944067','ed20534a-a811-4ea2-bf2a-b67c32a34bd8',100,21000.00),('8032fcb4-ce48-40e1-bcce-1c45bf4d2899','2f6ab4b0-7c2f-4bf1-99b5-38fd42e8bdf3',100,80000.00),('8512ec9a-613b-4a6f-8585-7d075f11ea28','dd5188b1-d60e-4fee-aea6-c84d54672d21',100,30000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','042f1219-748e-4bb0-909b-d9f4ef857534',100,30000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','08bf092e-b1d5-4c48-b093-c252f9c8ccb5',100,12000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','096cda99-6f3f-45b0-8a15-50b98f9f316c',100,201000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','0be6905f-fb99-4da7-9fdb-f1d95e5d343a',100,45000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',100,59400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','138755a4-1234-44aa-a175-9d981658d30b',100,57000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','17580c91-02cb-4fdb-a35e-0d994923398e',100,47400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','1895bdfc-2fd3-4e86-a7df-2bc2ab34c792',100,47400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','19602eff-6304-43e2-8bb8-b1c09dbb17a7',100,17400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','1a3dc39b-bccc-463e-a493-cb5a32b371f9',100,348000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','1c96210f-aa89-4e0c-a1d8-0d3d0d799e1a',100,102000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','209e287e-f0a3-4105-b5d3-cbb7014f41f8',100,33000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','2490aaa4-6273-42dd-8298-a57e57e477b8',100,144000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','271f040a-e039-4fbe-ab4e-e4f91e312025',100,24000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','276940fd-ae6f-4546-9c47-a704a0ce6171',100,12000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','2b22bedd-5397-414e-b2f7-1b104baea21c',100,167400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','2b9f9d85-7a53-41ef-b395-4fe78a5777d8',100,144000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','2d5c7720-b613-45cc-8a2a-8682bc56d18e',100,53400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','2f6ab4b0-7c2f-4bf1-99b5-38fd42e8bdf3',100,102000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','2f96fde0-8536-43d3-9fb2-b919306cfc1e',100,15000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','3c090b57-c4f3-4b29-96e1-e36d1482e23a',100,99000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','3c9367a9-9a32-495a-bb99-4043d16ee655',100,41400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','448e3647-63f8-4351-a709-6f03e704ea82',100,15000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','4d6ace7c-8110-41ac-b4b3-7781148a402e',100,29400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','57decd03-37f8-420f-81fb-c6b0a90f5912',100,89400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','5896494e-9b3f-456b-94c9-94286793c248',100,42000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','5f382eca-09f0-4ad4-9dd8-7816559b4d8d',100,131400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','6d75dd70-2f32-4e15-b1b5-4977a9a907ea',100,66000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','7a8363ec-f617-4adb-9ab0-0e84e2144300',100,77400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','8bb63156-7706-4f2f-804e-45f006afe548',100,57000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','9997339f-7e3c-432c-9921-f48180c671cb',100,114000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','9d886a7f-1355-4edb-98eb-7244c9042c28',100,96000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','a22e8946-0fbf-4ab9-9261-786483d37c7d',100,27000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','ac2237e0-5ac2-4c3d-aa35-c37b1fbdc8c7',100,258000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','b01fb178-3ccc-405e-9ffc-77714e749857',100,39000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','b4d8ea31-3f07-456f-be70-f54add2ad003',100,30000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','bd7f629e-4daa-4ede-8814-b7de0c614c0b',100,143400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','bda9a98b-1cba-4dcc-bf00-06ca8f736574',100,45000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','beace8e4-911e-419b-9fb0-574e920c5617',100,113400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','c270ec91-4476-4f4c-9dc3-7dea27263d2d',100,132000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','c30aacce-3aff-4f10-9286-029ff0e5a13e',100,87000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','c7fb4e4f-ca24-4d60-b346-936babbf1e1d',100,111000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','c98553b6-c724-432a-86d9-0221ba4cf428',100,45000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','cbb3a4ea-7cfc-4eaa-b5c4-c499e380705c',100,204000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','cdda2fe7-b650-494e-80f8-90f252f365bc',100,12000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','d8bb42e2-bbd2-4f90-838f-eb5fc4d382c0',100,57000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','d9926ce9-8bc8-4a49-add5-dc17d8248df6',100,81000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','dd5188b1-d60e-4fee-aea6-c84d54672d21',100,36000.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','de36ff01-0bc9-4cff-ab65-e2e0bae110ee',100,125400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','e7aeb13d-75e8-4e22-beec-7649135ab23b',100,125400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','e9d0f8f6-34ce-4100-bd79-a843c393d086',100,35400.00),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','ed20534a-a811-4ea2-bf2a-b67c32a34bd8',100,21000.00),('aa9439df-8677-4f9a-8381-b84086ac2dcf','2490aaa4-6273-42dd-8298-a57e57e477b8',100,50000.00),('aa9439df-8677-4f9a-8381-b84086ac2dcf','bda9a98b-1cba-4dcc-bf00-06ca8f736574',100,20000.00),('aa9439df-8677-4f9a-8381-b84086ac2dcf','c30aacce-3aff-4f10-9286-029ff0e5a13e',100,30000.00),('e01817a7-6a47-48cb-8352-3357ec59a616','dd5188b1-d60e-4fee-aea6-c84d54672d21',10,30000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','042f1219-748e-4bb0-909b-d9f4ef857534',100,30000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','08bf092e-b1d5-4c48-b093-c252f9c8ccb5',100,12000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','096cda99-6f3f-45b0-8a15-50b98f9f316c',100,201000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','0be6905f-fb99-4da7-9fdb-f1d95e5d343a',100,45000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','0d29b96e-570a-46a6-99b1-7f8f59f2c50b',100,59400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','138755a4-1234-44aa-a175-9d981658d30b',100,57000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','17580c91-02cb-4fdb-a35e-0d994923398e',100,47400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','1895bdfc-2fd3-4e86-a7df-2bc2ab34c792',100,47400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','19602eff-6304-43e2-8bb8-b1c09dbb17a7',100,17400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','1a3dc39b-bccc-463e-a493-cb5a32b371f9',100,348000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','1c96210f-aa89-4e0c-a1d8-0d3d0d799e1a',100,102000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','209e287e-f0a3-4105-b5d3-cbb7014f41f8',100,33000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','2490aaa4-6273-42dd-8298-a57e57e477b8',100,144000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','271f040a-e039-4fbe-ab4e-e4f91e312025',100,24000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','276940fd-ae6f-4546-9c47-a704a0ce6171',100,12000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','2b22bedd-5397-414e-b2f7-1b104baea21c',100,167400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','2b9f9d85-7a53-41ef-b395-4fe78a5777d8',100,144000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','2d5c7720-b613-45cc-8a2a-8682bc56d18e',100,53400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','2f6ab4b0-7c2f-4bf1-99b5-38fd42e8bdf3',100,102000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','2f96fde0-8536-43d3-9fb2-b919306cfc1e',100,15000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','3c090b57-c4f3-4b29-96e1-e36d1482e23a',100,99000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','3c9367a9-9a32-495a-bb99-4043d16ee655',100,41400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','448e3647-63f8-4351-a709-6f03e704ea82',100,15000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','4d6ace7c-8110-41ac-b4b3-7781148a402e',100,29400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','57decd03-37f8-420f-81fb-c6b0a90f5912',100,89400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','5896494e-9b3f-456b-94c9-94286793c248',100,42000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','5f382eca-09f0-4ad4-9dd8-7816559b4d8d',100,131400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','6d75dd70-2f32-4e15-b1b5-4977a9a907ea',100,66000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','7a8363ec-f617-4adb-9ab0-0e84e2144300',100,77400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','8bb63156-7706-4f2f-804e-45f006afe548',100,57000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','9997339f-7e3c-432c-9921-f48180c671cb',100,114000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','9d886a7f-1355-4edb-98eb-7244c9042c28',100,96000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','a22e8946-0fbf-4ab9-9261-786483d37c7d',100,27000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','ac2237e0-5ac2-4c3d-aa35-c37b1fbdc8c7',100,258000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','b01fb178-3ccc-405e-9ffc-77714e749857',100,39000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','b4d8ea31-3f07-456f-be70-f54add2ad003',100,30000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','bd7f629e-4daa-4ede-8814-b7de0c614c0b',100,143400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','bda9a98b-1cba-4dcc-bf00-06ca8f736574',100,45000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','beace8e4-911e-419b-9fb0-574e920c5617',100,113400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','c270ec91-4476-4f4c-9dc3-7dea27263d2d',100,132000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','c30aacce-3aff-4f10-9286-029ff0e5a13e',100,87000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','c7fb4e4f-ca24-4d60-b346-936babbf1e1d',100,111000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','c98553b6-c724-432a-86d9-0221ba4cf428',100,45000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','cbb3a4ea-7cfc-4eaa-b5c4-c499e380705c',100,204000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','cdda2fe7-b650-494e-80f8-90f252f365bc',100,12000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','d8bb42e2-bbd2-4f90-838f-eb5fc4d382c0',100,57000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','d9926ce9-8bc8-4a49-add5-dc17d8248df6',100,81000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','dd5188b1-d60e-4fee-aea6-c84d54672d21',100,36000.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','de36ff01-0bc9-4cff-ab65-e2e0bae110ee',100,125400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','e7aeb13d-75e8-4e22-beec-7649135ab23b',100,125400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','e9d0f8f6-34ce-4100-bd79-a843c393d086',100,35400.00),('eb998764-0c5a-4993-8e7b-ae875381f5f8','ed20534a-a811-4ea2-bf2a-b67c32a34bd8',100,21000.00);
/*!40000 ALTER TABLE `chi_tiet_nhap_hang` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ctnh_ai` AFTER INSERT ON `chi_tiet_nhap_hang` FOR EACH ROW BEGIN
    UPDATE san_pham
       SET so_luong_ton = so_luong_ton + NEW.so_luong
     WHERE ma_san_pham = NEW.ma_san_pham;

    UPDATE don_nhap_hang
       SET tong_tien = (SELECT COALESCE(SUM(thanh_tien), 0)
                          FROM chi_tiet_nhap_hang
                         WHERE ma_don_nhap = NEW.ma_don_nhap)
     WHERE ma_don_nhap = NEW.ma_don_nhap;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ctnh_au` AFTER UPDATE ON `chi_tiet_nhap_hang` FOR EACH ROW BEGIN
    UPDATE san_pham SET so_luong_ton = so_luong_ton - OLD.so_luong WHERE ma_san_pham = OLD.ma_san_pham;
    UPDATE san_pham SET so_luong_ton = so_luong_ton + NEW.so_luong WHERE ma_san_pham = NEW.ma_san_pham;

    UPDATE don_nhap_hang
       SET tong_tien = (SELECT COALESCE(SUM(thanh_tien), 0)
                          FROM chi_tiet_nhap_hang
                         WHERE ma_don_nhap = NEW.ma_don_nhap)
     WHERE ma_don_nhap = NEW.ma_don_nhap;

    IF OLD.ma_don_nhap <> NEW.ma_don_nhap THEN
        UPDATE don_nhap_hang
           SET tong_tien = (SELECT COALESCE(SUM(thanh_tien), 0)
                              FROM chi_tiet_nhap_hang
                             WHERE ma_don_nhap = OLD.ma_don_nhap)
         WHERE ma_don_nhap = OLD.ma_don_nhap;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_ctnh_ad` AFTER DELETE ON `chi_tiet_nhap_hang` FOR EACH ROW BEGIN
    UPDATE san_pham
       SET so_luong_ton = so_luong_ton - OLD.so_luong
     WHERE ma_san_pham = OLD.ma_san_pham;

    UPDATE don_nhap_hang
       SET tong_tien = (SELECT COALESCE(SUM(thanh_tien), 0)
                          FROM chi_tiet_nhap_hang
                         WHERE ma_don_nhap = OLD.ma_don_nhap)
     WHERE ma_don_nhap = OLD.ma_don_nhap;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `chuong_trinh_khuyen_mai`
--

DROP TABLE IF EXISTS `chuong_trinh_khuyen_mai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chuong_trinh_khuyen_mai` (
  `ma_ctkm` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_km` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngay_bat_dau` datetime NOT NULL,
  `ngay_ket_thuc` datetime NOT NULL,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_ctkm`),
  CONSTRAINT `ck_ctkm_ngay` CHECK ((`ngay_ket_thuc` >= `ngay_bat_dau`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuong_trinh_khuyen_mai`
--

LOCK TABLES `chuong_trinh_khuyen_mai` WRITE;
/*!40000 ALTER TABLE `chuong_trinh_khuyen_mai` DISABLE KEYS */;
INSERT INTO `chuong_trinh_khuyen_mai` VALUES ('2d38b61a-792b-4223-bce9-067e48534451','Từng bừng khai trương ưu đãi 200 khách hàng đầu tiên. Voucher giảm 20% mọi hóa đơn,','2026-10-09 03:39:09','2026-10-16 03:39:09','2026-10-09 03:41:36'),('91b2debd-d49b-4b8d-9cb2-192f400ea7ca','hihi','2026-10-10 09:16:56','2026-10-17 09:16:56','2026-10-10 09:17:50'),('cd94ba3f-1511-494f-a3d6-70f1d6f62a70','sale sale','2026-10-14 17:00:00','2026-10-16 17:00:00','2026-10-15 02:30:46'),('ce2f2d9c-cfc6-4e6e-97fe-32bebb9d7c1a','hóa đơn trên 1 triệu đồng giảm ngay 50k','2026-10-10 09:17:53','2026-10-17 09:17:53','2026-10-10 09:19:03'),('d3bd8091-b1a1-4378-b35e-d8d924de6c8d','Từng bừng khai trương ưu đãi 200 khách hàng đầu tiên. Voucher giảm 20% mọi hóa đơn,','2026-10-21 17:00:00','2026-10-30 17:00:00','2026-10-22 04:00:44'),('f87979fc-0bd8-4b44-8e6b-f9b7737156ff','Xả kho sale lớn','2026-10-09 17:00:00','2026-10-16 17:00:00','2026-10-10 09:34:39');
/*!40000 ALTER TABLE `chuong_trinh_khuyen_mai` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `danh_gia_san_pham`
--

DROP TABLE IF EXISTS `danh_gia_san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danh_gia_san_pham` (
  `ma_danh_gia` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_san_pham` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_khach_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_chi_tiet_don_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_sao` tinyint NOT NULL,
  `binh_luan` text COLLATE utf8mb4_unicode_ci,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_danh_gia`),
  UNIQUE KEY `uq_danh_gia_ctdh` (`ma_chi_tiet_don_hang`),
  KEY `idx_danh_gia_sp` (`ma_san_pham`),
  KEY `idx_danh_gia_kh` (`ma_khach_hang`),
  CONSTRAINT `fk_danh_gia_ctdh` FOREIGN KEY (`ma_chi_tiet_don_hang`) REFERENCES `chi_tiet_don_hang` (`ma_chi_tiet_don_hang`) ON DELETE CASCADE,
  CONSTRAINT `fk_danh_gia_kh` FOREIGN KEY (`ma_khach_hang`) REFERENCES `khach_hang` (`ma_nguoi_dung`) ON DELETE CASCADE,
  CONSTRAINT `fk_danh_gia_sp` FOREIGN KEY (`ma_san_pham`) REFERENCES `san_pham` (`ma_san_pham`) ON DELETE CASCADE,
  CONSTRAINT `ck_danh_gia_sao` CHECK ((`so_sao` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danh_gia_san_pham`
--

LOCK TABLES `danh_gia_san_pham` WRITE;
/*!40000 ALTER TABLE `danh_gia_san_pham` DISABLE KEYS */;
INSERT INTO `danh_gia_san_pham` VALUES ('0d21af44-7a90-416e-9f1e-ef44da3524ba','bda9a98b-1cba-4dcc-bf00-06ca8f736574','72a979e1-2e79-488a-8a6c-24587143a07b','2e953828-6c3d-4c1d-a14d-df8bbcff814a',5,'Khô gà rất ngon','2026-10-22 10:00:24'),('254ae854-8fee-4e31-a766-84e4b8d769ae','b4d8ea31-3f07-456f-be70-f54add2ad003','9a52ec9e-56ea-4d49-9e35-d294c7e48469','493a6e40-9119-4db9-94fb-dd531297b4b6',5,'Bánh tráng cuốn muối nhuyễn hành phi đỉnh chóp, giá hợp lý đóng gói cẩn thận.','2026-10-19 21:59:59'),('255396da-b8eb-47a0-bfca-e0e8ecd9f47a','271f040a-e039-4fbe-ab4e-e4f91e312025','b92e7307-244a-449f-87fc-a12e872fead8','059a1e6a-f985-4f4f-a155-967ad0cb2397',4,'Khô bò sợi mềm ngọt đậm đà, vắt thêm tí quất ăn xem bóng đá thì hết nước chấm.','2026-10-19 21:59:59'),('3b49b205-d466-43a1-906d-ab3ec83c95e4','4d6ace7c-8110-41ac-b4b3-7781148a402e','72a979e1-2e79-488a-8a6c-24587143a07b','0c64ec8d-1515-4514-bf91-31dd66dae58a',5,'Ngon','2026-10-22 11:02:15'),('46468439-8f5a-4f86-997b-b013ea9e6f92','0d29b96e-570a-46a6-99b1-7f8f59f2c50b','72a979e1-2e79-488a-8a6c-24587143a07b','c2b79ddb-a783-4950-8810-5ff0a7da4188',5,NULL,'2026-10-22 11:02:35'),('61a86675-74e8-4133-8e65-b190c93d783a','4d6ace7c-8110-41ac-b4b3-7781148a402e','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','56698946-80ae-4346-ac33-7658d07f2944',4,'Món ăn vặt rất vừa miệng cả nhà mình ai cũng khen, chấm kèm sốt tắc bơ ăn mê ly.','2026-10-19 22:00:00'),('6efca21e-4f03-4779-a4bb-0e34f6fc88c7','042f1219-748e-4bb0-909b-d9f4ef857534','015a9c77-da1f-4511-9239-1d76b9bd7ae2','e14e9e39-37b9-4d3e-af8f-9c25bdc71acd',5,'Đã thử nhiều nơi nhưng vị ở Snack Shop ăn cuốn nhất, 10 điểm chất lượng!','2026-10-19 22:00:00'),('7774711d-00c7-4320-bd9c-771d0713d5ee','2490aaa4-6273-42dd-8298-a57e57e477b8','72a979e1-2e79-488a-8a6c-24587143a07b','e5ba3326-c4b2-469a-9a40-bf003e2ad03f',5,NULL,'2026-10-22 10:00:09'),('91b2f190-70a8-4694-b028-07f27b49c02a','2f96fde0-8536-43d3-9fb2-b919306cfc1e','e8a9a826-7820-47fa-86fe-cda0582071f9','651ac262-65dc-406b-a87d-c41a1c861bab',5,'Cơm cháy chà bông siêu giòn rụm, sốt đậm đà cắn miếng nào đã miếng đó. Sẽ ủng hộ dài dài.','2026-10-19 21:59:59'),('a854dc64-1a3e-4b55-93f2-b2202bfc859f','271f040a-e039-4fbe-ab4e-e4f91e312025','72a979e1-2e79-488a-8a6c-24587143a07b','1fb3dcb0-1d7a-4b28-addc-15f8ad9242f0',5,NULL,'2026-10-22 11:02:31'),('c5cf2dc2-b573-41c8-874e-bd185647055f','276940fd-ae6f-4546-9c47-a704a0ce6171','72a979e1-2e79-488a-8a6c-24587143a07b','38ac4c7f-23dc-4aed-a7a6-bcfe07babe76',2,'Giao hàng chậm','2026-10-22 10:35:46'),('ebd6600b-1fc8-495c-aa8e-db8fc4187a61','bda9a98b-1cba-4dcc-bf00-06ca8f736574','015a9c77-da1f-4511-9239-1d76b9bd7ae2','c86514da-3b8f-4b36-a4e8-0797ef06359f',5,'Khô gà lá chanh cay cay giòn giòn, thơm nức mũi. Đóng túi zip bạc sạch sẽ chu đáo!','2026-10-19 21:59:43'),('f1dadd52-33b4-4f80-96d5-323e965d6cb5','209e287e-f0a3-4105-b5d3-cbb7014f41f8','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','88c1233e-8a97-416f-a36c-9c682639e232',5,'Khô gà lá chanh cay cay giòn giòn, thơm nức mũi. Đóng túi zip bạc sạch sẽ chu đáo!','2026-10-19 21:59:59'),('f2417cb8-a76a-481d-87eb-5ca99f362169','17580c91-02cb-4fdb-a35e-0d994923398e','b977ac86-637a-44ee-a39d-d1b3fd292c11','e66982e8-f0d3-4f71-a4fd-a5a0239e3ef9',5,'Giao hàng siêu tốc luôn, đồ ăn vặt bảo quản sạch sẽ và hạn sử dụng rất mới!','2026-10-19 21:59:59'),('f2a939ba-bb1e-475c-a8fa-75fcae416be1','271f040a-e039-4fbe-ab4e-e4f91e312025','d432cb62-e40c-425d-a837-5bc9f42d9a74','633abb59-a177-43db-b187-3e76d76f4947',5,'Bánh tráng phơi sương dẻo ngon chuẩn vị Trảng Bàng, sốt bơ béo ngậy ăn dính thật sự!','2026-10-19 21:59:59');
/*!40000 ALTER TABLE `danh_gia_san_pham` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_danh_gia_bi` BEFORE INSERT ON `danh_gia_san_pham` FOR EACH ROW BEGIN
    DECLARE v_san_pham   VARCHAR(36) DEFAULT NULL;
    DECLARE v_khach_hang VARCHAR(36) DEFAULT NULL;
    DECLARE v_trang_thai VARCHAR(20) DEFAULT NULL;

    SELECT ct.ma_san_pham, dh.ma_khach_hang, dh.trang_thai_don_hang
      INTO v_san_pham, v_khach_hang, v_trang_thai
      FROM chi_tiet_don_hang ct
      JOIN don_hang dh ON dh.ma_don_hang = ct.ma_don_hang
     WHERE ct.ma_chi_tiet_don_hang = NEW.ma_chi_tiet_don_hang;

    IF v_san_pham IS NULL OR v_san_pham <> NEW.ma_san_pham OR v_khach_hang <> NEW.ma_khach_hang THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Đánh giá không khớp với chi tiết đơn hàng';
    END IF;

    IF v_trang_thai <> 'da_giao' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chỉ được đánh giá khi đơn hàng đã giao';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `don_hang`
--

DROP TABLE IF EXISTS `don_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `don_hang` (
  `ma_don_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_khach_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_ctkm` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ten_nguoi_nhan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sdt_nguoi_nhan` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dia_chi_giao_hang` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ghi_chu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phi_van_chuyen` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tien_hang` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tien_giam_gia` decimal(15,2) NOT NULL DEFAULT '0.00',
  `tong_tien_thanh_toan` decimal(15,2) GENERATED ALWAYS AS (((`tien_hang` + `phi_van_chuyen`) - `tien_giam_gia`)) STORED,
  `phuong_thuc_thanh_toan` enum('cod','chuyen_khoan','vi_dien_tu','the') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cod',
  `trang_thai_thanh_toan` enum('chua_thanh_toan','da_thanh_toan','da_hoan_tien') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chua_thanh_toan',
  `trang_thai_don_hang` enum('cho_xac_nhan','da_xac_nhan','dang_giao','da_giao','da_huy') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cho_xac_nhan',
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_don_hang`),
  UNIQUE KEY `uq_don_hang_code` (`ma_code`),
  KEY `idx_don_hang_khach` (`ma_khach_hang`),
  KEY `idx_don_hang_ctkm` (`ma_ctkm`),
  KEY `idx_don_hang_trang_thai` (`trang_thai_don_hang`),
  KEY `idx_don_hang_ngay_tao` (`ngay_tao`),
  CONSTRAINT `fk_don_hang_ctkm` FOREIGN KEY (`ma_ctkm`) REFERENCES `chuong_trinh_khuyen_mai` (`ma_ctkm`) ON DELETE SET NULL,
  CONSTRAINT `fk_don_hang_khach` FOREIGN KEY (`ma_khach_hang`) REFERENCES `khach_hang` (`ma_nguoi_dung`),
  CONSTRAINT `ck_don_hang_tien` CHECK (((`phi_van_chuyen` >= 0) and (`tien_hang` >= 0) and (`tien_giam_gia` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `don_hang`
--

LOCK TABLES `don_hang` WRITE;
/*!40000 ALTER TABLE `don_hang` DISABLE KEYS */;
INSERT INTO `don_hang` (`ma_don_hang`, `ma_code`, `ma_khach_hang`, `ma_ctkm`, `ten_nguoi_nhan`, `sdt_nguoi_nhan`, `dia_chi_giao_hang`, `ghi_chu`, `phi_van_chuyen`, `tien_hang`, `tien_giam_gia`, `phuong_thuc_thanh_toan`, `trang_thai_thanh_toan`, `trang_thai_don_hang`, `ngay_tao`) VALUES ('0175c089-698d-452b-9e08-cdae723815ce','DH20261019041','5e1d4b47-b707-4b00-a6c1-b92d96b1e309',NULL,'Nguyễn Minh Tuấn','0901234561','12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM','Đơn hàng tự động #21',20000.00,158000.00,0.00,'cod','da_thanh_toan','da_giao','2026-10-19 14:54:18'),('03d43a95-27d0-4f7e-846d-f2e409e55da5','DH20261019014','32d11e20-fb78-44b6-8165-58cf4eec4dcb',NULL,'Nguyễn Minh Tuấn','0901234561','12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM','Đơn hàng tự động #21',20000.00,347000.00,0.00,'chuyen_khoan','da_thanh_toan','dang_giao','2026-10-19 14:53:29'),('04bf9134-4e6c-4265-923a-6e9731bfd38a','DH20261019002','246e3614-da3b-4302-b680-6e77499cf40b',NULL,'Lê Hoàng Long','0983456783','88 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội','Đơn hàng tự động #3',20000.00,174000.00,0.00,'cod','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:53:28'),('0be234e0-8b59-4cce-9274-f288278547c9','DH20261019013','4a75753f-bebe-4d9b-a79d-79e2ebd84e53',NULL,'Ngô Bảo Châu','0905123450','52 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM','Đơn hàng tự động #20',20000.00,348000.00,0.00,'cod','chua_thanh_toan','dang_giao','2026-10-19 14:53:29'),('0e9297b8-b8d9-4c73-9a02-e5fd1a2bab4a','DH20261019011','afb71611-ff79-49f4-820f-de1d0caff48f',NULL,'Bùi Thanh Tùng','0937890127','209 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận, TP.HCM','Đơn hàng tự động #17',20000.00,169000.00,0.00,'cod','chua_thanh_toan','dang_giao','2026-10-19 14:53:29'),('10f4e282-6cba-4220-91e1-469c182894c6','DH20261022001','72a979e1-2e79-488a-8a6c-24587143a07b',NULL,'Độ Mixi','0123456789','66b nguyễn sy sách, Quận Tân Bình, Tp HCM',NULL,20000.00,200000.00,0.00,'cod','da_thanh_toan','da_giao','2026-10-22 03:33:07'),('13a7b7b1-f6cd-48df-be1e-8eb91fbbffb1','DH20261019049','015a9c77-da1f-4511-9239-1d76b9bd7ae2',NULL,'Hồ Văn Khoa','0919012349','14 Đại lộ Hòa Bình, Phường Tân An, Quận Ninh Kiều, Cần Thơ','Đơn hàng tự động #29',20000.00,185000.00,0.00,'cod','da_thanh_toan','da_giao','2026-10-19 14:54:19'),('1592bb81-b859-40e0-a558-cd0cbd71748a','DH20261022004','72a979e1-2e79-488a-8a6c-24587143a07b',NULL,'Độ Mixi','0123456789','66b nguyễn sy sách, Quận Tân Bình, Tp HCM',NULL,0.00,945000.00,0.00,'cod','chua_thanh_toan','cho_xac_nhan','2026-10-22 04:10:43'),('15fda10f-e9cc-4ad6-a41a-02afd24263cc','DH20261019003','d15118ca-85ff-4c69-bea4-df6e39fd7a0d',NULL,'Vũ Đức Anh','0965678905','15 Trần Phú, Phường Máy Tơ, Quận Ngô Quyền, Hải Phòng','Đơn hàng tự động #5',20000.00,140000.00,0.00,'cod','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:53:28'),('23ca14f9-ee68-4df3-80f8-46f5cd26bf7a','DH20261019018','afb71611-ff79-49f4-820f-de1d0caff48f',NULL,'Bùi Thanh Tùng','0937890127','209 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận, TP.HCM','Đơn hàng tự động #27',20000.00,556000.00,0.00,'cod','da_thanh_toan','dang_giao','2026-10-19 14:53:29'),('281bf98b-6dbe-41b5-bf73-4bdba9a669c9','DH20261019012','3a1a03cc-5482-4696-b6a8-077b13789d03',NULL,'Đỗ Quỳnh Chi','0928901238','67 Hoàng Hoa Thám, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội','Đơn hàng tự động #18',20000.00,178000.00,0.00,'cod','chua_thanh_toan','dang_giao','2026-10-19 14:53:29'),('2a9d9ed7-3522-43ee-b973-83c3bbe77411','DH20261019024','d432cb62-e40c-425d-a837-5bc9f42d9a74',NULL,'Phạm Thu Hà','0974567894','102 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM','Đơn hàng tự động #4',20000.00,58000.00,0.00,'the','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:54:17'),('2ee02347-a23a-4051-8cb0-b61055d26c86','DH20261019039','015a9c77-da1f-4511-9239-1d76b9bd7ae2',NULL,'Hồ Văn Khoa','0919012349','14 Đại lộ Hòa Bình, Phường Tân An, Quận Ninh Kiều, Cần Thơ','Đơn hàng tự động #19',20000.00,50000.00,0.00,'vi_dien_tu','da_thanh_toan','da_giao','2026-10-19 14:54:18'),('3742c1c2-99a6-4a30-82a2-5af6ee80427f','DH20261019021','5e1d4b47-b707-4b00-a6c1-b92d96b1e309',NULL,'Nguyễn Minh Tuấn','0901234561','12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM','Đơn hàng tự động #1',20000.00,298000.00,0.00,'cod','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:54:17'),('38fbe4ff-8095-4faa-92cb-55c7efd7d843','DH20261009001','72a979e1-2e79-488a-8a6c-24587143a07b',NULL,'tran Khách Hàng','0975500219','66b nguyễn sy sách, phường tân bình','giao gio hanh chinh',20000.00,225000.00,0.00,'cod','da_thanh_toan','da_giao','2026-10-09 03:28:42'),('3d53f02c-d7ad-4d37-8e3d-95fc19d3e59b','DH20261019032','bb447281-8c82-458c-989f-a6a2ee10036a',NULL,'Trần Thị Mai','0912345672','45 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #12',20000.00,433000.00,0.00,'the','chua_thanh_toan','da_xac_nhan','2026-10-19 14:54:18'),('41a92d29-5796-4e34-bad0-8af5cf0e0495','DH20261019037','9a52ec9e-56ea-4d49-9e35-d294c7e48469',NULL,'Bùi Thanh Tùng','0937890127','209 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận, TP.HCM','Đơn hàng tự động #17',20000.00,113000.00,0.00,'cod','chua_thanh_toan','dang_giao','2026-10-19 14:54:18'),('4442fa15-185d-40d1-9125-4578f685e3b1','DH20261019042','bb447281-8c82-458c-989f-a6a2ee10036a',NULL,'Trần Thị Mai','0912345672','45 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #22',20000.00,45000.00,0.00,'chuyen_khoan','da_thanh_toan','dang_giao','2026-10-19 14:54:18'),('556e0a79-027d-45b1-a254-b25c00100ab2','DH20261022003','72a979e1-2e79-488a-8a6c-24587143a07b','d3bd8091-b1a1-4378-b35e-d8d924de6c8d','Độ Mixi','0123456789','66b nguyễn sy sách, Quận Tân Bình, Tp HCM',NULL,0.00,228000.00,50000.00,'cod','da_thanh_toan','da_giao','2026-10-22 04:00:59'),('57e63094-6193-4c39-b225-f0d4790adb27','DH20261019016','c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa',NULL,'Phạm Thu Hà','0974567894','102 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM','Đơn hàng tự động #24',20000.00,259000.00,0.00,'cod','da_thanh_toan','dang_giao','2026-10-19 14:53:29'),('5b396d0c-f1ce-469d-a7c3-dcf09fe0b696','DH20261019040','74d44da8-7c6c-423b-9013-58bf5ebeaa59',NULL,'Ngô Bảo Châu','0905123450','52 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM','Đơn hàng tự động #20',20000.00,247000.00,0.00,'the','chua_thanh_toan','dang_giao','2026-10-19 14:54:18'),('5f22c76f-45d1-4c1d-a135-91c93ec235a9','DH20261019001','6502853d-5e05-49ff-bc98-65305c76dcc4',NULL,'Trần Thị Mai','0912345672','45 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #2',20000.00,168000.00,0.00,'cod','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:53:28'),('6126d4b3-d48b-457d-bf94-04a3ada05644','DH20261019044','d432cb62-e40c-425d-a837-5bc9f42d9a74',NULL,'Phạm Thu Hà','0974567894','102 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM','Đơn hàng tự động #24',20000.00,328000.00,0.00,'the','da_thanh_toan','da_giao','2026-10-19 14:54:19'),('64c9bad3-77fe-4068-a255-c466904cd8c7','DH20261019038','b977ac86-637a-44ee-a39d-d1b3fd292c11',NULL,'Đỗ Quỳnh Chi','0928901238','67 Hoàng Hoa Thám, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội','Đơn hàng tự động #18',20000.00,308000.00,0.00,'chuyen_khoan','chua_thanh_toan','dang_giao','2026-10-19 14:54:18'),('64ea5ef8-fa06-43ad-9400-85d43a731305','DH20261019034','d432cb62-e40c-425d-a837-5bc9f42d9a74',NULL,'Phạm Thu Hà','0974567894','102 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM','Đơn hàng tự động #14',20000.00,179000.00,0.00,'chuyen_khoan','chua_thanh_toan','da_xac_nhan','2026-10-19 14:54:18'),('661833b8-56a9-4b84-9cb0-e3702557a9d1','DH20261015001','72a979e1-2e79-488a-8a6c-24587143a07b',NULL,'tran Khách Hàng','0123456789','dsa',NULL,20000.00,200000.00,0.00,'cod','da_thanh_toan','da_giao','2026-10-15 01:17:32'),('67e94fdb-bb64-4595-9315-76c94e4d1754','DH20261019035','b92e7307-244a-449f-87fc-a12e872fead8',NULL,'Vũ Đức Anh','0965678905','15 Trần Phú, Phường Máy Tơ, Quận Ngô Quyền, Hải Phòng','Đơn hàng tự động #15',20000.00,218000.00,0.00,'vi_dien_tu','chua_thanh_toan','dang_giao','2026-10-19 14:54:18'),('703885ba-3942-475a-8d0c-873518c57c3d','DH20261019029','015a9c77-da1f-4511-9239-1d76b9bd7ae2',NULL,'Hồ Văn Khoa','0919012349','14 Đại lộ Hòa Bình, Phường Tân An, Quận Ninh Kiều, Cần Thơ','Đơn hàng tự động #9',20000.00,346000.00,0.00,'cod','chua_thanh_toan','da_xac_nhan','2026-10-19 14:54:18'),('7304b7f6-8e0e-48be-92f1-131d43b49698','DH20261019007','32d11e20-fb78-44b6-8165-58cf4eec4dcb',NULL,'Nguyễn Minh Tuấn','0901234561','12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM','Đơn hàng tự động #11',20000.00,287000.00,0.00,'chuyen_khoan','chua_thanh_toan','da_xac_nhan','2026-10-19 14:53:28'),('74a078b9-594a-4bbc-9b40-f8259a06136c','DH20261019005','3a1a03cc-5482-4696-b6a8-077b13789d03',NULL,'Đỗ Quỳnh Chi','0928901238','67 Hoàng Hoa Thám, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội','Đơn hàng tự động #8',20000.00,358000.00,0.00,'cod','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:53:28'),('7bbf10d4-2f41-40c2-80f8-988423a01641','DH20261019019','e9ee2035-fc61-455f-b578-024de1a9f0cb',NULL,'Hồ Văn Khoa','0919012349','14 Đại lộ Hòa Bình, Phường Tân An, Quận Ninh Kiều, Cần Thơ','Đơn hàng tự động #29',20000.00,277000.00,0.00,'cod','da_thanh_toan','dang_giao','2026-10-19 14:53:30'),('7d735118-af33-497f-9b52-e364b5af31eb','DH20261019031','5e1d4b47-b707-4b00-a6c1-b92d96b1e309',NULL,'Nguyễn Minh Tuấn','0901234561','12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM','Đơn hàng tự động #11',20000.00,179000.00,0.00,'vi_dien_tu','chua_thanh_toan','da_xac_nhan','2026-10-19 14:54:18'),('7f46b43c-dca1-4bca-b10f-320b12eda032','DH20261019030','74d44da8-7c6c-423b-9013-58bf5ebeaa59',NULL,'Ngô Bảo Châu','0905123450','52 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM','Đơn hàng tự động #10',20000.00,50000.00,0.00,'chuyen_khoan','chua_thanh_toan','da_xac_nhan','2026-10-19 14:54:18'),('862a5a2d-ed3b-41d3-902c-837451ac37e6','DH20261019028','b977ac86-637a-44ee-a39d-d1b3fd292c11',NULL,'Đỗ Quỳnh Chi','0928901238','67 Hoàng Hoa Thám, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội','Đơn hàng tự động #8',20000.00,218000.00,0.00,'the','chua_thanh_toan','dang_giao','2026-10-19 14:54:18'),('8d50ea8b-9b8d-4df4-a067-5419091369a9','DH20261010002','da9082e3-4d77-4684-8a05-068fb882974e',NULL,'Độ Mixi','+84975500219','Quận 1',NULL,20000.00,720000.00,0.00,'cod','da_thanh_toan','da_giao','2026-10-10 07:02:28'),('94a98a18-8d82-4109-8cfa-5663eca25348','DH20261022002','c3126b7f-c03f-47a3-98ce-1af0612e7dd1',NULL,'Nguyễn Hoàng Nhật Anh','0776825509','361/19/32A Bình Đông, P15, Q8',NULL,20000.00,375000.00,0.00,'cod','chua_thanh_toan','cho_xac_nhan','2026-10-22 03:42:22'),('9becdeec-f998-42c7-8489-98ed82605c76','DH20261019022','bb447281-8c82-458c-989f-a6a2ee10036a',NULL,'Trần Thị Mai','0912345672','45 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #2',20000.00,158000.00,0.00,'chuyen_khoan','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:54:17'),('a51ca0ad-bb7a-4c6f-8697-90f3d79e10bc','DH20261019027','9a52ec9e-56ea-4d49-9e35-d294c7e48469',NULL,'Bùi Thanh Tùng','0937890127','209 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận, TP.HCM','Đơn hàng tự động #7',20000.00,100000.00,0.00,'vi_dien_tu','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:54:18'),('a73f5cc1-2ad9-4be0-8a9d-889a2bc99ae6','DH20261019025','b92e7307-244a-449f-87fc-a12e872fead8',NULL,'Vũ Đức Anh','0965678905','15 Trần Phú, Phường Máy Tơ, Quận Ngô Quyền, Hải Phòng','Đơn hàng tự động #5',20000.00,199000.00,0.00,'cod','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:54:18'),('a94acd00-cff7-414a-828f-42d5f552e5b5','DH20261019043','3bd1e802-3b54-4089-acc6-1cf1ee3080a7',NULL,'Lê Hoàng Long','0983456783','88 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội','Đơn hàng tự động #23',20000.00,239000.00,0.00,'vi_dien_tu','da_thanh_toan','da_giao','2026-10-19 14:54:19'),('b06bb0a1-14d1-4133-96ee-e3e4c7eaaea8','DH20261019006','e9ee2035-fc61-455f-b578-024de1a9f0cb',NULL,'Hồ Văn Khoa','0919012349','14 Đại lộ Hòa Bình, Phường Tân An, Quận Ninh Kiều, Cần Thơ','Đơn hàng tự động #9',20000.00,373000.00,0.00,'cod','chua_thanh_toan','da_xac_nhan','2026-10-19 14:53:28'),('b0ac8864-1934-4c83-8b44-fba37ff6faf4','DH20261019036','e8a9a826-7820-47fa-86fe-cda0582071f9',NULL,'Đặng Ngọc Ánh','0946789016','36 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #16',20000.00,50000.00,0.00,'the','chua_thanh_toan','dang_giao','2026-10-19 14:54:18'),('b5ee2e47-1c9d-4a3d-976b-34b4d87af4a8','DH20261019046','e8a9a826-7820-47fa-86fe-cda0582071f9',NULL,'Đặng Ngọc Ánh','0946789016','36 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #26',20000.00,50000.00,0.00,'chuyen_khoan','da_thanh_toan','da_giao','2026-10-19 14:54:19'),('b6548e86-eb64-4d30-bd51-9502110f202d','DH20261019020','4a75753f-bebe-4d9b-a79d-79e2ebd84e53',NULL,'Ngô Bảo Châu','0905123450','52 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM','Đơn hàng tự động #30',20000.00,373000.00,0.00,'cod','chua_thanh_toan','da_huy','2026-10-19 14:53:30'),('bcf492d8-4fd3-401c-aab3-0c89b46eb3a5','DH20261019045','b92e7307-244a-449f-87fc-a12e872fead8',NULL,'Vũ Đức Anh','0965678905','15 Trần Phú, Phường Máy Tơ, Quận Ngô Quyền, Hải Phòng','Đơn hàng tự động #25',20000.00,80000.00,0.00,'cod','da_thanh_toan','da_giao','2026-10-19 14:54:19'),('bfe5336a-fdb7-4bf7-b99d-e730284d57e7','DH20261019048','b977ac86-637a-44ee-a39d-d1b3fd292c11',NULL,'Đỗ Quỳnh Chi','0928901238','67 Hoàng Hoa Thám, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội','Đơn hàng tự động #28',20000.00,158000.00,0.00,'the','da_thanh_toan','da_giao','2026-10-19 14:54:19'),('cb475858-0bd7-46e5-99c3-e38217c4531f','DH20261019009','c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa',NULL,'Phạm Thu Hà','0974567894','102 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM','Đơn hàng tự động #14',20000.00,308000.00,0.00,'cod','chua_thanh_toan','da_xac_nhan','2026-10-19 14:53:28'),('d329f874-e60e-4b50-a112-00d8d2653517','DH20261019033','3bd1e802-3b54-4089-acc6-1cf1ee3080a7',NULL,'Lê Hoàng Long','0983456783','88 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội','Đơn hàng tự động #13',20000.00,258000.00,0.00,'cod','chua_thanh_toan','da_xac_nhan','2026-10-19 14:54:18'),('d55264ea-4e31-4340-8b0a-502379cf77c6','DH20261019050','74d44da8-7c6c-423b-9013-58bf5ebeaa59',NULL,'Ngô Bảo Châu','0905123450','52 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM','Đơn hàng tự động #30',20000.00,646000.00,0.00,'chuyen_khoan','chua_thanh_toan','da_huy','2026-10-19 14:54:20'),('d695c9f9-8d33-4614-a01b-130a6852f153','DH20261010001','72a979e1-2e79-488a-8a6c-24587143a07b','2d38b61a-792b-4223-bce9-067e48534451','tran Khách Hàng','0123456789','66b nguyễn sy sách',NULL,20000.00,1920000.00,100000.00,'cod','da_thanh_toan','da_giao','2026-10-10 02:48:43'),('d75b0681-d3f0-46a1-8dde-e34564518ca9','DH20261019026','e8a9a826-7820-47fa-86fe-cda0582071f9',NULL,'Đặng Ngọc Ánh','0946789016','36 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #6',20000.00,255000.00,0.00,'chuyen_khoan','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:54:18'),('dc6a9e11-ecc0-410e-88b0-79830f613dcf','DH20261019017','6c0c2b2d-7ff0-48cc-81ad-97c4712ed484',NULL,'Đặng Ngọc Ánh','0946789016','36 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #26',20000.00,130000.00,0.00,'chuyen_khoan','da_thanh_toan','dang_giao','2026-10-19 14:53:29'),('dee53ecf-2899-4da9-b1f2-b2789520125b','DH20261019023','3bd1e802-3b54-4089-acc6-1cf1ee3080a7',NULL,'Lê Hoàng Long','0983456783','88 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội','Đơn hàng tự động #3',20000.00,237000.00,0.00,'vi_dien_tu','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:54:17'),('e06d1b83-64dc-4649-8490-9ad937149052','DH20261019015','246e3614-da3b-4302-b680-6e77499cf40b',NULL,'Lê Hoàng Long','0983456783','88 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội','Đơn hàng tự động #23',20000.00,250000.00,0.00,'cod','da_thanh_toan','dang_giao','2026-10-19 14:53:29'),('efdd75e0-0a9e-4a77-8ea5-d46c7fbcf69a','DH20261019047','9a52ec9e-56ea-4d49-9e35-d294c7e48469',NULL,'Bùi Thanh Tùng','0937890127','209 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận, TP.HCM','Đơn hàng tự động #27',20000.00,418000.00,0.00,'vi_dien_tu','da_thanh_toan','da_giao','2026-10-19 14:54:19'),('f3d41f2d-0e62-4fa1-bbbd-b28767d3115e','DH20261019008','6502853d-5e05-49ff-bc98-65305c76dcc4',NULL,'Trần Thị Mai','0912345672','45 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #12',20000.00,199000.00,0.00,'cod','chua_thanh_toan','da_xac_nhan','2026-10-19 14:53:28'),('f653e0fe-c254-4569-9820-9e545d4595c6','DH20261019004','6c0c2b2d-7ff0-48cc-81ad-97c4712ed484',NULL,'Đặng Ngọc Ánh','0946789016','36 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng','Đơn hàng tự động #6',20000.00,218000.00,0.00,'chuyen_khoan','chua_thanh_toan','cho_xac_nhan','2026-10-19 14:53:28'),('f9ad9572-3b1b-40b0-ae77-286a3c2faacc','DH20261019010','d15118ca-85ff-4c69-bea4-df6e39fd7a0d',NULL,'Vũ Đức Anh','0965678905','15 Trần Phú, Phường Máy Tơ, Quận Ngô Quyền, Hải Phòng','Đơn hàng tự động #15',20000.00,225000.00,0.00,'cod','chua_thanh_toan','dang_giao','2026-10-19 14:53:28'),('fa129f7e-3b02-4ada-8148-2125c705189d','DH20261010003','da9082e3-4d77-4684-8a05-068fb882974e','2d38b61a-792b-4223-bce9-067e48534451','Độ Mixi','+84975500219','Quận 1',NULL,20000.00,4815000.00,100000.00,'cod','da_thanh_toan','da_giao','2026-10-10 08:11:21');
/*!40000 ALTER TABLE `don_hang` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_don_hang_bi` BEFORE INSERT ON `don_hang` FOR EACH ROW BEGIN
    DECLARE v_gioi_han   INT DEFAULT NULL;
    DECLARE v_da_dung    INT DEFAULT NULL;
    DECLARE v_moi_khach  INT DEFAULT NULL;
    DECLARE v_so_lan     INT DEFAULT 0;
    DECLARE v_hop_le     INT DEFAULT 0;

    IF NEW.ma_ctkm IS NOT NULL THEN
        -- Chương trình phải đang trong thời gian hiệu lực
        SELECT COUNT(*) INTO v_hop_le
          FROM chuong_trinh_khuyen_mai
         WHERE ma_ctkm = NEW.ma_ctkm
           AND COALESCE(NEW.ngay_tao, NOW()) BETWEEN ngay_bat_dau AND ngay_ket_thuc;

        IF v_hop_le = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chương trình khuyến mãi không tồn tại hoặc đã hết hạn';
        END IF;

        -- Nếu là voucher thì kiểm tra giới hạn sử dụng
        SELECT gioi_han_su_dung, so_luot_da_dung, gioi_han_moi_khach
          INTO v_gioi_han, v_da_dung, v_moi_khach
          FROM khuyen_mai_theo_voucher
         WHERE ma_ctkm = NEW.ma_ctkm;

        IF v_gioi_han IS NOT NULL AND v_da_dung >= v_gioi_han THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Voucher đã hết lượt sử dụng';
        END IF;

        IF v_moi_khach IS NOT NULL THEN
            SELECT COUNT(*) INTO v_so_lan
              FROM don_hang
             WHERE ma_khach_hang = NEW.ma_khach_hang
               AND ma_ctkm = NEW.ma_ctkm
               AND trang_thai_don_hang <> 'da_huy';

            IF v_so_lan >= v_moi_khach THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Khách hàng đã dùng hết số lần cho phép của voucher này';
            END IF;
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_don_hang_ai` AFTER INSERT ON `don_hang` FOR EACH ROW BEGIN
    INSERT INTO lich_su_don_hang (ma_lich_su, ma_don_hang, nguoi_thuc_hien, trang_thai, ghi_chu)
    VALUES (UUID(), NEW.ma_don_hang, @nguoi_thuc_hien, NEW.trang_thai_don_hang, 'Tạo đơn hàng');

    INSERT INTO thong_bao (ma_thong_bao, ma_nguoi_dung, tieu_de, noi_dung)
    VALUES (UUID(), NEW.ma_khach_hang, 'Đặt hàng thành công',
            CONCAT('Đơn hàng ', NEW.ma_code, ' đã được tạo và đang chờ xác nhận.'));

    IF NEW.ma_ctkm IS NOT NULL THEN
        UPDATE khuyen_mai_theo_voucher
           SET so_luot_da_dung = so_luot_da_dung + 1
         WHERE ma_ctkm = NEW.ma_ctkm;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_don_hang_bu` BEFORE UPDATE ON `don_hang` FOR EACH ROW BEGIN
    IF OLD.trang_thai_don_hang = 'da_huy' AND NEW.trang_thai_don_hang <> 'da_huy' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Đơn hàng đã hủy, không thể khôi phục trạng thái';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_don_hang_au` AFTER UPDATE ON `don_hang` FOR EACH ROW BEGIN
    DECLARE v_ten_trang_thai VARCHAR(100);
    IF OLD.trang_thai_don_hang <> NEW.trang_thai_don_hang THEN
        CASE NEW.trang_thai_don_hang
            WHEN 'da_xac_nhan' THEN SET v_ten_trang_thai = 'Đã xác nhận';
            WHEN 'dang_giao' THEN SET v_ten_trang_thai = 'Đang giao hàng';
            WHEN 'da_giao' THEN SET v_ten_trang_thai = 'Đã giao hàng';
            WHEN 'da_huy' THEN SET v_ten_trang_thai = 'Đã hủy';
            ELSE SET v_ten_trang_thai = 'Chờ xác nhận';
        END CASE;

        INSERT INTO lich_su_don_hang (ma_lich_su, ma_don_hang, nguoi_thuc_hien, trang_thai, ghi_chu)
        VALUES (UUID(), NEW.ma_don_hang, @nguoi_thuc_hien, NEW.trang_thai_don_hang,
                CONCAT('Chuyển sang trạng thái: ', v_ten_trang_thai));

        INSERT INTO thong_bao (ma_thong_bao, ma_nguoi_dung, tieu_de, noi_dung)
        VALUES (UUID(), NEW.ma_khach_hang, 'Cập nhật đơn hàng',
                CONCAT('Đơn hàng ', NEW.ma_code, ' đã chuyển sang: ', v_ten_trang_thai));

        IF NEW.trang_thai_don_hang = 'da_huy' THEN
            UPDATE san_pham sp
              JOIN chi_tiet_don_hang ct ON ct.ma_san_pham = sp.ma_san_pham
               SET sp.so_luong_ton = sp.so_luong_ton + ct.so_luong
             WHERE ct.ma_don_hang = NEW.ma_don_hang;

            IF NEW.ma_ctkm IS NOT NULL THEN
                UPDATE khuyen_mai_theo_voucher
                   SET so_luot_da_dung = GREATEST(so_luot_da_dung - 1, 0)
                 WHERE ma_ctkm = NEW.ma_ctkm;
            END IF;
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `don_nhap_hang`
--

DROP TABLE IF EXISTS `don_nhap_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `don_nhap_hang` (
  `ma_don_nhap` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_nha_cung_cap` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_nhan_vien` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tong_tien` decimal(15,2) NOT NULL DEFAULT '0.00',
  `ngay_nhap_kho` datetime DEFAULT NULL,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_don_nhap`),
  KEY `idx_don_nhap_ncc` (`ma_nha_cung_cap`),
  KEY `idx_don_nhap_nv` (`ma_nhan_vien`),
  CONSTRAINT `fk_don_nhap_ncc` FOREIGN KEY (`ma_nha_cung_cap`) REFERENCES `nha_cung_cap` (`ma_nha_cung_cap`),
  CONSTRAINT `fk_don_nhap_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nguoi_dung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `don_nhap_hang`
--

LOCK TABLES `don_nhap_hang` WRITE;
/*!40000 ALTER TABLE `don_nhap_hang` DISABLE KEYS */;
INSERT INTO `don_nhap_hang` VALUES ('23bf871c-155f-42ec-a1ce-fc0610711b91','79e98706-5105-45b6-8305-0e1e07d5d096','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3',13500000.00,'2026-10-10 15:19:22','2026-10-10 15:19:22'),('275819d2-1c61-4ece-8e65-9aa2a5dd589d','79e98706-5105-45b6-8305-0e1e07d5d096','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3',54000000.00,'2026-10-10 15:06:54','2026-10-10 15:06:54'),('2926d9aa-c7a6-4ca1-9483-4752fdcf2e1e','79e98706-5105-45b6-8305-0e1e07d5d096','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3',44500000.00,'2026-10-10 15:09:06','2026-10-10 15:09:06'),('65648307-39ca-46ae-8064-a9c0cf944067','79e98706-5105-45b6-8305-0e1e07d5d096','20846904-dcb9-4fa8-81d2-051fe335e10f',424740000.00,'2026-10-11 13:14:23','2026-10-11 13:14:23'),('8032fcb4-ce48-40e1-bcce-1c45bf4d2899','79e98706-5105-45b6-8305-0e1e07d5d096','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3',8000000.00,'2026-10-10 15:04:55','2026-10-10 15:04:55'),('8512ec9a-613b-4a6f-8585-7d075f11ea28','79e98706-5105-45b6-8305-0e1e07d5d096','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3',3000000.00,'2026-10-10 14:56:23','2026-10-10 14:56:23'),('a0e1b02a-d188-4165-abdf-f12dd6f238a1','79e98706-5105-45b6-8305-0e1e07d5d096','20846904-dcb9-4fa8-81d2-051fe335e10f',424740000.00,'2026-10-19 21:53:27','2026-10-19 21:53:27'),('aa9439df-8677-4f9a-8381-b84086ac2dcf','7d08a898-02f2-40cd-a368-c526b20f88e0','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3',10000000.00,'2026-10-09 10:26:19','2026-10-09 10:26:19'),('e01817a7-6a47-48cb-8352-3357ec59a616','79e98706-5105-45b6-8305-0e1e07d5d096','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3',300000.00,'2026-10-10 15:04:23','2026-10-10 15:04:23'),('eb998764-0c5a-4993-8e7b-ae875381f5f8','79e98706-5105-45b6-8305-0e1e07d5d096','20846904-dcb9-4fa8-81d2-051fe335e10f',424740000.00,'2026-10-19 21:54:17','2026-10-19 21:54:17');
/*!40000 ALTER TABLE `don_nhap_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hinh_anh_san_pham`
--

DROP TABLE IF EXISTS `hinh_anh_san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hinh_anh_san_pham` (
  `ma_hinh_anh` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_san_pham` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duong_dan_anh` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `la_anh_chinh` tinyint(1) NOT NULL DEFAULT '0',
  `thu_tu_hien_thi` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ma_hinh_anh`),
  KEY `idx_hinh_anh_san_pham` (`ma_san_pham`),
  CONSTRAINT `fk_hinh_anh_san_pham` FOREIGN KEY (`ma_san_pham`) REFERENCES `san_pham` (`ma_san_pham`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hinh_anh_san_pham`
--

LOCK TABLES `hinh_anh_san_pham` WRITE;
/*!40000 ALTER TABLE `hinh_anh_san_pham` DISABLE KEYS */;
/*!40000 ALTER TABLE `hinh_anh_san_pham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoa_don`
--

DROP TABLE IF EXISTS `hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_don` (
  `ma_hoa_don` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_don_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_nhan_vien` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `so_hoa_don` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tong_tien` decimal(15,2) NOT NULL DEFAULT '0.00',
  `ngay_xuat_hoa_don` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_hoa_don`),
  UNIQUE KEY `uq_hoa_don_don_hang` (`ma_don_hang`),
  UNIQUE KEY `uq_hoa_don_so` (`so_hoa_don`),
  KEY `idx_hoa_don_nv` (`ma_nhan_vien`),
  CONSTRAINT `fk_hoa_don_don_hang` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`),
  CONSTRAINT `fk_hoa_don_nv` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nguoi_dung`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoa_don`
--

LOCK TABLES `hoa_don` WRITE;
/*!40000 ALTER TABLE `hoa_don` DISABLE KEYS */;
INSERT INTO `hoa_don` VALUES ('21a942ee-e903-4a98-a1ff-2f6e9e589254','fa129f7e-3b02-4ada-8148-2125c705189d','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','HD20261010003',4815000.00,'2026-10-10 08:36:36'),('44b12c4b-2e0d-4190-96cc-efc553cc6802','0175c089-698d-452b-9e08-cdae723815ce','20846904-dcb9-4fa8-81d2-051fe335e10f','HD20261019008',158000.00,'2026-10-19 14:59:59'),('4eec7e5f-c816-4afd-a575-3e3de0a2125b','38fbe4ff-8095-4faa-92cb-55c7efd7d843','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','HD20261010004',225000.00,'2026-10-10 08:37:41'),('553709b8-8114-422a-96d9-434634d13c12','efdd75e0-0a9e-4a77-8ea5-d46c7fbcf69a','20846904-dcb9-4fa8-81d2-051fe335e10f','HD20261019007',418000.00,'2026-10-19 14:59:59'),('5da871a5-b9d3-4c73-b3c8-b25d79c86586','2ee02347-a23a-4051-8cb0-b61055d26c86','20846904-dcb9-4fa8-81d2-051fe335e10f','HD20261019009',50000.00,'2026-10-19 15:00:00'),('644128cf-5dcd-4bd7-bd4d-06e1a2efb0ba','8d50ea8b-9b8d-4df4-a067-5419091369a9','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','HD20261010001',720000.00,'2026-10-10 07:30:57'),('7c207467-1470-4652-a2e1-83fd465adbaf','10f4e282-6cba-4220-91e1-469c182894c6','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','HD20261022002',200000.00,'2026-10-22 03:36:00'),('9a14ebd8-e32f-4231-948a-f1c4fe9f7d6c','13a7b7b1-f6cd-48df-be1e-8eb91fbbffb1','20846904-dcb9-4fa8-81d2-051fe335e10f','HD20261019001',185000.00,'2026-10-19 14:59:34'),('afd85e9a-03ff-44e7-87e1-333e55761732','bfe5336a-fdb7-4bf7-b99d-e730284d57e7','20846904-dcb9-4fa8-81d2-051fe335e10f','HD20261019006',158000.00,'2026-10-19 14:59:59'),('bc4e8a09-fea4-4e81-8c14-3e5de54b28fc','661833b8-56a9-4b84-9cb0-e3702557a9d1','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','HD20261022001',200000.00,'2026-10-22 03:34:58'),('cf47d36c-d855-46f3-b656-ab992da5a2ac','a94acd00-cff7-414a-828f-42d5f552e5b5','20846904-dcb9-4fa8-81d2-051fe335e10f','HD20261019003',239000.00,'2026-10-19 14:59:59'),('d0ecbf04-4ad9-4bcc-a089-261eb1254b09','556e0a79-027d-45b1-a254-b25c00100ab2','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','HD20261022003',228000.00,'2026-10-22 04:01:57'),('da59b024-6091-45cf-ad74-ba760d11e7cc','6126d4b3-d48b-457d-bf94-04a3ada05644','20846904-dcb9-4fa8-81d2-051fe335e10f','HD20261019002',328000.00,'2026-10-19 14:59:59'),('ed7c44fa-ea63-4ca4-8dc9-5aab973b39ca','b5ee2e47-1c9d-4a3d-976b-34b4d87af4a8','20846904-dcb9-4fa8-81d2-051fe335e10f','HD20261019004',50000.00,'2026-10-19 14:59:59'),('f0eaf98a-d9f1-4f73-a312-760443c41711','bcf492d8-4fd3-401c-aab3-0c89b46eb3a5','20846904-dcb9-4fa8-81d2-051fe335e10f','HD20261019005',80000.00,'2026-10-19 14:59:59'),('f325d59a-656d-417a-a864-09f6cd2b7b5d','d695c9f9-8d33-4614-a01b-130a6852f153','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','HD20261010002',1920000.00,'2026-10-10 08:36:25');
/*!40000 ALTER TABLE `hoa_don` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_hoa_don_bi` BEFORE INSERT ON `hoa_don` FOR EACH ROW BEGIN
    DECLARE v_trang_thai VARCHAR(20) DEFAULT NULL;

    SELECT trang_thai_don_hang INTO v_trang_thai
      FROM don_hang WHERE ma_don_hang = NEW.ma_don_hang;

    IF v_trang_thai = 'da_huy' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không thể xuất hóa đơn cho đơn hàng đã hủy';
    END IF;

    SET NEW.tong_tien = (SELECT COALESCE(SUM(thanh_tien), 0)
                           FROM chi_tiet_don_hang
                          WHERE ma_don_hang = NEW.ma_don_hang);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `khach_hang`
--

DROP TABLE IF EXISTS `khach_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khach_hang` (
  `ma_nguoi_dung` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ma_nguoi_dung`),
  CONSTRAINT `fk_khach_hang_nguoi_dung` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khach_hang`
--

LOCK TABLES `khach_hang` WRITE;
/*!40000 ALTER TABLE `khach_hang` DISABLE KEYS */;
INSERT INTO `khach_hang` VALUES ('015a9c77-da1f-4511-9239-1d76b9bd7ae2'),('246e3614-da3b-4302-b680-6e77499cf40b'),('32d11e20-fb78-44b6-8165-58cf4eec4dcb'),('3a1a03cc-5482-4696-b6a8-077b13789d03'),('3bd1e802-3b54-4089-acc6-1cf1ee3080a7'),('4a75753f-bebe-4d9b-a79d-79e2ebd84e53'),('4fe3aeb0-293d-44dc-a09f-bdcbaa8967ac'),('5e1d4b47-b707-4b00-a6c1-b92d96b1e309'),('6502853d-5e05-49ff-bc98-65305c76dcc4'),('6c0c2b2d-7ff0-48cc-81ad-97c4712ed484'),('72a979e1-2e79-488a-8a6c-24587143a07b'),('74d44da8-7c6c-423b-9013-58bf5ebeaa59'),('9a52ec9e-56ea-4d49-9e35-d294c7e48469'),('afb71611-ff79-49f4-820f-de1d0caff48f'),('b0f5c951-ac55-4e69-b1a7-5d71d9e3ea3f'),('b92e7307-244a-449f-87fc-a12e872fead8'),('b977ac86-637a-44ee-a39d-d1b3fd292c11'),('bb447281-8c82-458c-989f-a6a2ee10036a'),('c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa'),('c3126b7f-c03f-47a3-98ce-1af0612e7dd1'),('d15118ca-85ff-4c69-bea4-df6e39fd7a0d'),('d432cb62-e40c-425d-a837-5bc9f42d9a74'),('da9082e3-4d77-4684-8a05-068fb882974e'),('df950492-81c5-4133-a11b-331c9f789fd9'),('e2413c55-702c-439d-93e4-f55e3ff92722'),('e8a9a826-7820-47fa-86fe-cda0582071f9'),('e9ee2035-fc61-455f-b578-024de1a9f0cb'),('f8cafad3-a622-4afc-b4b9-e9f92bc03ac3');
/*!40000 ALTER TABLE `khach_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khuyen_mai_theo_hoa_don`
--

DROP TABLE IF EXISTS `khuyen_mai_theo_hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khuyen_mai_theo_hoa_don` (
  `ma_ctkm` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_km` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gia_tri_don_toi_thieu` decimal(15,2) NOT NULL DEFAULT '0.00',
  `loai_giam_gia` enum('phan_tram','so_tien') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gia_tri_giam` decimal(15,2) NOT NULL,
  `giam_toi_da` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`ma_ctkm`),
  CONSTRAINT `fk_kmhd_ctkm` FOREIGN KEY (`ma_ctkm`) REFERENCES `chuong_trinh_khuyen_mai` (`ma_ctkm`) ON DELETE CASCADE,
  CONSTRAINT `ck_kmhd_gia_tri` CHECK (((`gia_tri_giam` >= 0) and ((`loai_giam_gia` <> _utf8mb4'phan_tram') or (`gia_tri_giam` <= 100))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khuyen_mai_theo_hoa_don`
--

LOCK TABLES `khuyen_mai_theo_hoa_don` WRITE;
/*!40000 ALTER TABLE `khuyen_mai_theo_hoa_don` DISABLE KEYS */;
INSERT INTO `khuyen_mai_theo_hoa_don` VALUES ('ce2f2d9c-cfc6-4e6e-97fe-32bebb9d7c1a','hóa đơn trên 1 triệu đồng giảm ngay 50k',1000000.00,'so_tien',50000.00,NULL);
/*!40000 ALTER TABLE `khuyen_mai_theo_hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khuyen_mai_theo_san_pham`
--

DROP TABLE IF EXISTS `khuyen_mai_theo_san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khuyen_mai_theo_san_pham` (
  `ma_ctkm` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_san_pham` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_km` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loai_giam_gia` enum('phan_tram','so_tien') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gia_tri_giam` decimal(15,2) NOT NULL,
  PRIMARY KEY (`ma_ctkm`,`ma_san_pham`),
  KEY `idx_kmsp_san_pham` (`ma_san_pham`),
  CONSTRAINT `fk_kmsp_ctkm` FOREIGN KEY (`ma_ctkm`) REFERENCES `chuong_trinh_khuyen_mai` (`ma_ctkm`) ON DELETE CASCADE,
  CONSTRAINT `fk_kmsp_san_pham` FOREIGN KEY (`ma_san_pham`) REFERENCES `san_pham` (`ma_san_pham`) ON DELETE CASCADE,
  CONSTRAINT `ck_kmsp_gia_tri` CHECK (((`gia_tri_giam` >= 0) and ((`loai_giam_gia` <> _utf8mb4'phan_tram') or (`gia_tri_giam` <= 100))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khuyen_mai_theo_san_pham`
--

LOCK TABLES `khuyen_mai_theo_san_pham` WRITE;
/*!40000 ALTER TABLE `khuyen_mai_theo_san_pham` DISABLE KEYS */;
INSERT INTO `khuyen_mai_theo_san_pham` VALUES ('cd94ba3f-1511-494f-a3d6-70f1d6f62a70','271f040a-e039-4fbe-ab4e-e4f91e312025','sale sale','phan_tram',20.00),('f87979fc-0bd8-4b44-8e6b-f9b7737156ff','ed20534a-a811-4ea2-bf2a-b67c32a34bd8','Xả kho sale lớn','phan_tram',15.00);
/*!40000 ALTER TABLE `khuyen_mai_theo_san_pham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khuyen_mai_theo_voucher`
--

DROP TABLE IF EXISTS `khuyen_mai_theo_voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khuyen_mai_theo_voucher` (
  `ma_ctkm` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_km` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loai_giam_gia` enum('phan_tram','so_tien') COLLATE utf8mb4_unicode_ci NOT NULL,
  `gia_tri_giam` decimal(15,2) NOT NULL,
  `gia_tri_don_toi_thieu` decimal(15,2) NOT NULL DEFAULT '0.00',
  `giam_toi_da` decimal(15,2) DEFAULT NULL,
  `gioi_han_su_dung` int DEFAULT NULL,
  `so_luot_da_dung` int NOT NULL DEFAULT '0',
  `gioi_han_moi_khach` int DEFAULT NULL,
  PRIMARY KEY (`ma_ctkm`),
  UNIQUE KEY `uq_voucher_code` (`ma_code`),
  CONSTRAINT `fk_kmvc_ctkm` FOREIGN KEY (`ma_ctkm`) REFERENCES `chuong_trinh_khuyen_mai` (`ma_ctkm`) ON DELETE CASCADE,
  CONSTRAINT `ck_kmvc_gia_tri` CHECK (((`gia_tri_giam` >= 0) and ((`loai_giam_gia` <> _utf8mb4'phan_tram') or (`gia_tri_giam` <= 100)))),
  CONSTRAINT `ck_kmvc_luot` CHECK ((`so_luot_da_dung` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khuyen_mai_theo_voucher`
--

LOCK TABLES `khuyen_mai_theo_voucher` WRITE;
/*!40000 ALTER TABLE `khuyen_mai_theo_voucher` DISABLE KEYS */;
INSERT INTO `khuyen_mai_theo_voucher` VALUES ('2d38b61a-792b-4223-bce9-067e48534451','Từng bừng khai trương ưu đãi 200 khách hàng đầu tiên. Voucher giảm 20% mọi hóa đơn,','KHAITRUONG20','phan_tram',20.00,0.00,100000.00,200,2,1),('91b2debd-d49b-4b8d-9cb2-192f400ea7ca','hihi','HIHI','so_tien',10000.00,100000.00,NULL,100,0,1),('d3bd8091-b1a1-4378-b35e-d8d924de6c8d','Từng bừng khai trương ưu đãi 200 khách hàng đầu tiên. Voucher giảm 20% mọi hóa đơn,','KHAITRUONG25','phan_tram',25.00,0.00,50000.00,1000,1,1);
/*!40000 ALTER TABLE `khuyen_mai_theo_voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_don_hang`
--

DROP TABLE IF EXISTS `lich_su_don_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_don_hang` (
  `ma_lich_su` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_don_hang` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nguoi_thuc_hien` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai` enum('cho_xac_nhan','da_xac_nhan','dang_giao','da_giao','da_huy') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ghi_chu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_lich_su`),
  KEY `idx_lich_su_don_hang` (`ma_don_hang`),
  KEY `idx_lich_su_nguoi` (`nguoi_thuc_hien`),
  CONSTRAINT `fk_lich_su_don_hang` FOREIGN KEY (`ma_don_hang`) REFERENCES `don_hang` (`ma_don_hang`) ON DELETE CASCADE,
  CONSTRAINT `fk_lich_su_nguoi` FOREIGN KEY (`nguoi_thuc_hien`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_don_hang`
--

LOCK TABLES `lich_su_don_hang` WRITE;
/*!40000 ALTER TABLE `lich_su_don_hang` DISABLE KEYS */;
INSERT INTO `lich_su_don_hang` VALUES ('1b3a345f-c455-11f1-a019-00ff7cdd344a','d695c9f9-8d33-4614-a01b-130a6852f153','72a979e1-2e79-488a-8a6c-24587143a07b','cho_xac_nhan','Tạo đơn hàng','2026-10-10 09:48:43'),('2d562f8b-c482-11f1-a019-00ff7cdd344a','fa129f7e-3b02-4ada-8148-2125c705189d','da9082e3-4d77-4684-8a05-068fb882974e','cho_xac_nhan','Tạo đơn hàng','2026-10-10 15:11:21'),('307a67f3-cdcd-11f1-8adc-00ff7cdd344a','556e0a79-027d-45b1-a254-b25c00100ab2','72a979e1-2e79-488a-8a6c-24587143a07b','cho_xac_nhan','Tạo đơn hàng','2026-10-22 11:00:59'),('32263b9e-c836-11f1-bf6c-00ff7cdd344a','661833b8-56a9-4b84-9cb0-e3702557a9d1','72a979e1-2e79-488a-8a6c-24587143a07b','cho_xac_nhan','Tạo đơn hàng','2026-10-15 08:17:32'),('327a3cb8-cbcd-11f1-9946-00ff7cdd344a','862a5a2d-ed3b-41d3-902c-837451ac37e6','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:56:00'),('327d6342-cbcd-11f1-9946-00ff7cdd344a','862a5a2d-ed3b-41d3-902c-837451ac37e6','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:56:00'),('393b789e-cdcd-11f1-8adc-00ff7cdd344a','556e0a79-027d-45b1-a254-b25c00100ab2','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_xac_nhan','Chuyển sang trạng thái: Đã xác nhận (Bếp đang chuẩn bị món)','2026-10-22 11:01:13'),('4c2e1e63-cdc9-11f1-8adc-00ff7cdd344a','10f4e282-6cba-4220-91e1-469c182894c6','72a979e1-2e79-488a-8a6c-24587143a07b','cho_xac_nhan','Tạo đơn hàng','2026-10-22 10:33:07'),('4f9b4632-cdcd-11f1-8adc-00ff7cdd344a','556e0a79-027d-45b1-a254-b25c00100ab2','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','dang_giao','Chuyển sang trạng thái: Đang giao hàng (Shipper đang đến)','2026-10-22 11:01:51'),('52d44d26-cdcd-11f1-8adc-00ff7cdd344a','556e0a79-027d-45b1-a254-b25c00100ab2','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_giao','Chuyển sang trạng thái: Đã giao hàng thành công','2026-10-22 11:01:56'),('6ef3b56c-c482-11f1-a019-00ff7cdd344a','fa129f7e-3b02-4ada-8148-2125c705189d','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-10 15:13:11'),('7746a5b9-cdc9-11f1-8adc-00ff7cdd344a','10f4e282-6cba-4220-91e1-469c182894c6','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-22 10:34:19'),('84cc473c-c47c-11f1-a019-00ff7cdd344a','8d50ea8b-9b8d-4df4-a067-5419091369a9','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-10 14:30:50'),('85a4332b-c47c-11f1-a019-00ff7cdd344a','8d50ea8b-9b8d-4df4-a067-5419091369a9','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-10 14:30:52'),('86b714cd-c391-11f1-a019-00ff7cdd344a','38fbe4ff-8095-4faa-92cb-55c7efd7d843','72a979e1-2e79-488a-8a6c-24587143a07b','cho_xac_nhan','Tạo đơn hàng','2026-10-09 10:28:42'),('871679bd-c47c-11f1-a019-00ff7cdd344a','8d50ea8b-9b8d-4df4-a067-5419091369a9','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-10 14:30:54'),('8cc1f092-cdce-11f1-8adc-00ff7cdd344a','1592bb81-b859-40e0-a558-cd0cbd71748a','72a979e1-2e79-488a-8a6c-24587143a07b','cho_xac_nhan','Tạo đơn hàng','2026-10-22 11:10:43'),('8de0275a-c478-11f1-a019-00ff7cdd344a','8d50ea8b-9b8d-4df4-a067-5419091369a9','da9082e3-4d77-4684-8a05-068fb882974e','cho_xac_nhan','Tạo đơn hàng','2026-10-10 14:02:28'),('8e052cd9-cdc9-11f1-8adc-00ff7cdd344a','661833b8-56a9-4b84-9cb0-e3702557a9d1','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-22 10:34:57'),('96ce8f96-cdca-11f1-8adc-00ff7cdd344a','94a98a18-8d82-4109-8cfa-5663eca25348','c3126b7f-c03f-47a3-98ce-1af0612e7dd1','cho_xac_nhan','Tạo đơn hàng','2026-10-22 10:42:22'),('a64b365b-c485-11f1-a019-00ff7cdd344a','d695c9f9-8d33-4614-a01b-130a6852f153','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-10 15:36:12'),('a6ecbee4-c485-11f1-a019-00ff7cdd344a','d695c9f9-8d33-4614-a01b-130a6852f153','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-10 15:36:13'),('a90e6679-cdc9-11f1-8adc-00ff7cdd344a','10f4e282-6cba-4220-91e1-469c182894c6','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-22 10:35:43'),('adccfef1-c485-11f1-a019-00ff7cdd344a','d695c9f9-8d33-4614-a01b-130a6852f153','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-10 15:36:25'),('b25383a6-cbcd-11f1-9946-00ff7cdd344a','13a7b7b1-f6cd-48df-be1e-8eb91fbbffb1','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-19 21:59:34'),('b2ac9957-c485-11f1-a019-00ff7cdd344a','fa129f7e-3b02-4ada-8148-2125c705189d','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-10 15:36:33'),('b32615f8-cdc9-11f1-8adc-00ff7cdd344a','10f4e282-6cba-4220-91e1-469c182894c6','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-22 10:36:00'),('b414fb18-c485-11f1-a019-00ff7cdd344a','fa129f7e-3b02-4ada-8148-2125c705189d','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-10 15:36:35'),('c0af98b8-cbcd-11f1-9946-00ff7cdd344a','6126d4b3-d48b-457d-bf94-04a3ada05644','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-19 21:59:58'),('c0c9f009-cbcd-11f1-9946-00ff7cdd344a','a94acd00-cff7-414a-828f-42d5f552e5b5','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-19 21:59:58'),('c0e0ff0e-cbcd-11f1-9946-00ff7cdd344a','b5ee2e47-1c9d-4a3d-976b-34b4d87af4a8','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-19 21:59:58'),('c0f1c665-cbcd-11f1-9946-00ff7cdd344a','bcf492d8-4fd3-401c-aab3-0c89b46eb3a5','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-19 21:59:59'),('c101fb9a-cbcd-11f1-9946-00ff7cdd344a','bfe5336a-fdb7-4bf7-b99d-e730284d57e7','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-19 21:59:59'),('c1121424-cbcd-11f1-9946-00ff7cdd344a','efdd75e0-0a9e-4a77-8ea5-d46c7fbcf69a','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-19 21:59:59'),('c123c75d-cbcd-11f1-9946-00ff7cdd344a','0175c089-698d-452b-9e08-cdae723815ce','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-19 21:59:59'),('c1358701-cbcd-11f1-9946-00ff7cdd344a','2ee02347-a23a-4051-8cb0-b61055d26c86','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-19 21:59:59'),('d7b508ae-cbcc-11f1-9946-00ff7cdd344a','5f22c76f-45d1-4c1d-a135-91c93ec235a9','6502853d-5e05-49ff-bc98-65305c76dcc4','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:27'),('d7d61038-cbcc-11f1-9946-00ff7cdd344a','04bf9134-4e6c-4265-923a-6e9731bfd38a','246e3614-da3b-4302-b680-6e77499cf40b','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d7ddabd2-cbcc-11f1-9946-00ff7cdd344a','15fda10f-e9cc-4ad6-a41a-02afd24263cc','d15118ca-85ff-4c69-bea4-df6e39fd7a0d','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d7e35d8a-cbcc-11f1-9946-00ff7cdd344a','f653e0fe-c254-4569-9820-9e545d4595c6','6c0c2b2d-7ff0-48cc-81ad-97c4712ed484','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d7ea50b7-cbcc-11f1-9946-00ff7cdd344a','74a078b9-594a-4bbc-9b40-f8259a06136c','3a1a03cc-5482-4696-b6a8-077b13789d03','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d7ef7c2f-cbcc-11f1-9946-00ff7cdd344a','b06bb0a1-14d1-4133-96ee-e3e4c7eaaea8','e9ee2035-fc61-455f-b578-024de1a9f0cb','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d7f6d0d8-cbcc-11f1-9946-00ff7cdd344a','b06bb0a1-14d1-4133-96ee-e3e4c7eaaea8','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:28'),('d7fd6f6e-cbcc-11f1-9946-00ff7cdd344a','7304b7f6-8e0e-48be-92f1-131d43b49698','32d11e20-fb78-44b6-8165-58cf4eec4dcb','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d801ffdd-cbcc-11f1-9946-00ff7cdd344a','7304b7f6-8e0e-48be-92f1-131d43b49698','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:28'),('d806a90a-cbcc-11f1-9946-00ff7cdd344a','f3d41f2d-0e62-4fa1-bbbd-b28767d3115e','6502853d-5e05-49ff-bc98-65305c76dcc4','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d80cea98-cbcc-11f1-9946-00ff7cdd344a','f3d41f2d-0e62-4fa1-bbbd-b28767d3115e','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:28'),('d8132efc-cbcc-11f1-9946-00ff7cdd344a','cb475858-0bd7-46e5-99c3-e38217c4531f','c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d8172733-cbcc-11f1-9946-00ff7cdd344a','cb475858-0bd7-46e5-99c3-e38217c4531f','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:28'),('d81b882f-cbcc-11f1-9946-00ff7cdd344a','f9ad9572-3b1b-40b0-ae77-286a3c2faacc','d15118ca-85ff-4c69-bea4-df6e39fd7a0d','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d81f6aca-cbcc-11f1-9946-00ff7cdd344a','f9ad9572-3b1b-40b0-ae77-286a3c2faacc','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:28'),('d822a9ce-cbcc-11f1-9946-00ff7cdd344a','f9ad9572-3b1b-40b0-ae77-286a3c2faacc','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:28'),('d828a9a0-cbcc-11f1-9946-00ff7cdd344a','0e9297b8-b8d9-4c73-9a02-e5fd1a2bab4a','afb71611-ff79-49f4-820f-de1d0caff48f','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d82cd20c-cbcc-11f1-9946-00ff7cdd344a','0e9297b8-b8d9-4c73-9a02-e5fd1a2bab4a','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:28'),('d8301b88-cbcc-11f1-9946-00ff7cdd344a','0e9297b8-b8d9-4c73-9a02-e5fd1a2bab4a','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:28'),('d83481a9-cbcc-11f1-9946-00ff7cdd344a','281bf98b-6dbe-41b5-bf73-4bdba9a669c9','3a1a03cc-5482-4696-b6a8-077b13789d03','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d838d60b-cbcc-11f1-9946-00ff7cdd344a','281bf98b-6dbe-41b5-bf73-4bdba9a669c9','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:28'),('d83cc656-cbcc-11f1-9946-00ff7cdd344a','281bf98b-6dbe-41b5-bf73-4bdba9a669c9','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:28'),('d8431304-cbcc-11f1-9946-00ff7cdd344a','0be234e0-8b59-4cce-9274-f288278547c9','4a75753f-bebe-4d9b-a79d-79e2ebd84e53','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d8470d57-cbcc-11f1-9946-00ff7cdd344a','0be234e0-8b59-4cce-9274-f288278547c9','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:28'),('d84a5cdc-cbcc-11f1-9946-00ff7cdd344a','0be234e0-8b59-4cce-9274-f288278547c9','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:28'),('d84eb780-cbcc-11f1-9946-00ff7cdd344a','03d43a95-27d0-4f7e-846d-f2e409e55da5','32d11e20-fb78-44b6-8165-58cf4eec4dcb','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:28'),('d852b0d2-cbcc-11f1-9946-00ff7cdd344a','03d43a95-27d0-4f7e-846d-f2e409e55da5','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:28'),('d855da36-cbcc-11f1-9946-00ff7cdd344a','03d43a95-27d0-4f7e-846d-f2e409e55da5','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:28'),('d86e2750-cbcc-11f1-9946-00ff7cdd344a','e06d1b83-64dc-4649-8490-9ad937149052','246e3614-da3b-4302-b680-6e77499cf40b','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:29'),('d8721cdc-cbcc-11f1-9946-00ff7cdd344a','e06d1b83-64dc-4649-8490-9ad937149052','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:29'),('d87537ac-cbcc-11f1-9946-00ff7cdd344a','e06d1b83-64dc-4649-8490-9ad937149052','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:29'),('d8847381-cbcc-11f1-9946-00ff7cdd344a','57e63094-6193-4c39-b225-f0d4790adb27','c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:29'),('d8889420-cbcc-11f1-9946-00ff7cdd344a','57e63094-6193-4c39-b225-f0d4790adb27','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:29'),('d88bc676-cbcc-11f1-9946-00ff7cdd344a','57e63094-6193-4c39-b225-f0d4790adb27','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:29'),('d89ce7f6-cbcc-11f1-9946-00ff7cdd344a','dc6a9e11-ecc0-410e-88b0-79830f613dcf','6c0c2b2d-7ff0-48cc-81ad-97c4712ed484','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:29'),('d8a1fe90-cbcc-11f1-9946-00ff7cdd344a','dc6a9e11-ecc0-410e-88b0-79830f613dcf','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:29'),('d8a5bfee-cbcc-11f1-9946-00ff7cdd344a','dc6a9e11-ecc0-410e-88b0-79830f613dcf','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:29'),('d8b4e8fa-cbcc-11f1-9946-00ff7cdd344a','23ca14f9-ee68-4df3-80f8-46f5cd26bf7a','afb71611-ff79-49f4-820f-de1d0caff48f','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:29'),('d8b905a0-cbcc-11f1-9946-00ff7cdd344a','23ca14f9-ee68-4df3-80f8-46f5cd26bf7a','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:29'),('d8bcf549-cbcc-11f1-9946-00ff7cdd344a','23ca14f9-ee68-4df3-80f8-46f5cd26bf7a','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:29'),('d8ccdf0e-cbcc-11f1-9946-00ff7cdd344a','7bbf10d4-2f41-40c2-80f8-988423a01641','e9ee2035-fc61-455f-b578-024de1a9f0cb','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:29'),('d8d1186e-cbcc-11f1-9946-00ff7cdd344a','7bbf10d4-2f41-40c2-80f8-988423a01641','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:53:29'),('d8d4b9bb-cbcc-11f1-9946-00ff7cdd344a','7bbf10d4-2f41-40c2-80f8-988423a01641','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:53:29'),('d8e43dcb-cbcc-11f1-9946-00ff7cdd344a','b6548e86-eb64-4d30-bd51-9502110f202d','4a75753f-bebe-4d9b-a79d-79e2ebd84e53','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:53:29'),('d8e97e61-cbcc-11f1-9946-00ff7cdd344a','b6548e86-eb64-4d30-bd51-9502110f202d','4a75753f-bebe-4d9b-a79d-79e2ebd84e53','da_huy','Chuyển từ cho_xac_nhan sang da_huy','2026-10-19 21:53:29'),('d92ce6fe-c485-11f1-a019-00ff7cdd344a','38fbe4ff-8095-4faa-92cb-55c7efd7d843','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-10 15:37:37'),('d9dd97bf-c485-11f1-a019-00ff7cdd344a','38fbe4ff-8095-4faa-92cb-55c7efd7d843','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-10 15:37:39'),('db491bc1-c485-11f1-a019-00ff7cdd344a','38fbe4ff-8095-4faa-92cb-55c7efd7d843','f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','da_giao','Chuyển từ dang_giao sang da_giao','2026-10-10 15:37:41'),('f53fc4d3-cbcc-11f1-9946-00ff7cdd344a','3742c1c2-99a6-4a30-82a2-5af6ee80427f','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f5487c71-cbcc-11f1-9946-00ff7cdd344a','9becdeec-f998-42c7-8489-98ed82605c76','bb447281-8c82-458c-989f-a6a2ee10036a','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f54db41f-cbcc-11f1-9946-00ff7cdd344a','dee53ecf-2899-4da9-b1f2-b2789520125b','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f551fea1-cbcc-11f1-9946-00ff7cdd344a','2a9d9ed7-3522-43ee-b973-83c3bbe77411','d432cb62-e40c-425d-a837-5bc9f42d9a74','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f5564378-cbcc-11f1-9946-00ff7cdd344a','a73f5cc1-2ad9-4be0-8a9d-889a2bc99ae6','b92e7307-244a-449f-87fc-a12e872fead8','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f55ac52d-cbcc-11f1-9946-00ff7cdd344a','d75b0681-d3f0-46a1-8dde-e34564518ca9','e8a9a826-7820-47fa-86fe-cda0582071f9','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f55f6399-cbcc-11f1-9946-00ff7cdd344a','a51ca0ad-bb7a-4c6f-8697-90f3d79e10bc','9a52ec9e-56ea-4d49-9e35-d294c7e48469','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f5637360-cbcc-11f1-9946-00ff7cdd344a','862a5a2d-ed3b-41d3-902c-837451ac37e6','b977ac86-637a-44ee-a39d-d1b3fd292c11','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f567f857-cbcc-11f1-9946-00ff7cdd344a','703885ba-3942-475a-8d0c-873518c57c3d','015a9c77-da1f-4511-9239-1d76b9bd7ae2','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f56c7290-cbcc-11f1-9946-00ff7cdd344a','703885ba-3942-475a-8d0c-873518c57c3d','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:17'),('f570bb0a-cbcc-11f1-9946-00ff7cdd344a','7f46b43c-dca1-4bca-b10f-320b12eda032','74d44da8-7c6c-423b-9013-58bf5ebeaa59','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f5747388-cbcc-11f1-9946-00ff7cdd344a','7f46b43c-dca1-4bca-b10f-320b12eda032','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:17'),('f5788a96-cbcc-11f1-9946-00ff7cdd344a','7d735118-af33-497f-9b52-e364b5af31eb','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f57c60f6-cbcc-11f1-9946-00ff7cdd344a','7d735118-af33-497f-9b52-e364b5af31eb','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:17'),('f5804b60-cbcc-11f1-9946-00ff7cdd344a','3d53f02c-d7ad-4d37-8e3d-95fc19d3e59b','bb447281-8c82-458c-989f-a6a2ee10036a','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f5849b22-cbcc-11f1-9946-00ff7cdd344a','3d53f02c-d7ad-4d37-8e3d-95fc19d3e59b','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:17'),('f588b16c-cbcc-11f1-9946-00ff7cdd344a','d329f874-e60e-4b50-a112-00d8d2653517','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f58c7012-cbcc-11f1-9946-00ff7cdd344a','d329f874-e60e-4b50-a112-00d8d2653517','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:17'),('f591d460-cbcc-11f1-9946-00ff7cdd344a','64ea5ef8-fa06-43ad-9400-85d43a731305','d432cb62-e40c-425d-a837-5bc9f42d9a74','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f595e006-cbcc-11f1-9946-00ff7cdd344a','64ea5ef8-fa06-43ad-9400-85d43a731305','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:17'),('f599e770-cbcc-11f1-9946-00ff7cdd344a','67e94fdb-bb64-4595-9315-76c94e4d1754','b92e7307-244a-449f-87fc-a12e872fead8','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:17'),('f59db6bb-cbcc-11f1-9946-00ff7cdd344a','67e94fdb-bb64-4595-9315-76c94e4d1754','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:17'),('f5a0c68f-cbcc-11f1-9946-00ff7cdd344a','67e94fdb-bb64-4595-9315-76c94e4d1754','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:17'),('f5a4a4c7-cbcc-11f1-9946-00ff7cdd344a','b0ac8864-1934-4c83-8b44-fba37ff6faf4','e8a9a826-7820-47fa-86fe-cda0582071f9','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f5a81173-cbcc-11f1-9946-00ff7cdd344a','b0ac8864-1934-4c83-8b44-fba37ff6faf4','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f5aaf150-cbcc-11f1-9946-00ff7cdd344a','b0ac8864-1934-4c83-8b44-fba37ff6faf4','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f5af45db-cbcc-11f1-9946-00ff7cdd344a','41a92d29-5796-4e34-bad0-8af5cf0e0495','9a52ec9e-56ea-4d49-9e35-d294c7e48469','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f5b3541d-cbcc-11f1-9946-00ff7cdd344a','41a92d29-5796-4e34-bad0-8af5cf0e0495','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f5b669b6-cbcc-11f1-9946-00ff7cdd344a','41a92d29-5796-4e34-bad0-8af5cf0e0495','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f5ba7908-cbcc-11f1-9946-00ff7cdd344a','64c9bad3-77fe-4068-a255-c466904cd8c7','b977ac86-637a-44ee-a39d-d1b3fd292c11','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f5be3cda-cbcc-11f1-9946-00ff7cdd344a','64c9bad3-77fe-4068-a255-c466904cd8c7','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f5c14008-cbcc-11f1-9946-00ff7cdd344a','64c9bad3-77fe-4068-a255-c466904cd8c7','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f5c4ded6-cbcc-11f1-9946-00ff7cdd344a','2ee02347-a23a-4051-8cb0-b61055d26c86','015a9c77-da1f-4511-9239-1d76b9bd7ae2','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f5c7ec84-cbcc-11f1-9946-00ff7cdd344a','2ee02347-a23a-4051-8cb0-b61055d26c86','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f5cb310d-cbcc-11f1-9946-00ff7cdd344a','2ee02347-a23a-4051-8cb0-b61055d26c86','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f5cf2e88-cbcc-11f1-9946-00ff7cdd344a','5b396d0c-f1ce-469d-a7c3-dcf09fe0b696','74d44da8-7c6c-423b-9013-58bf5ebeaa59','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f5d2a63c-cbcc-11f1-9946-00ff7cdd344a','5b396d0c-f1ce-469d-a7c3-dcf09fe0b696','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f5d57c5a-cbcc-11f1-9946-00ff7cdd344a','5b396d0c-f1ce-469d-a7c3-dcf09fe0b696','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f5d97b5f-cbcc-11f1-9946-00ff7cdd344a','0175c089-698d-452b-9e08-cdae723815ce','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f5dd3817-cbcc-11f1-9946-00ff7cdd344a','0175c089-698d-452b-9e08-cdae723815ce','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f5e03d18-cbcc-11f1-9946-00ff7cdd344a','0175c089-698d-452b-9e08-cdae723815ce','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f5ed4c23-cbcc-11f1-9946-00ff7cdd344a','4442fa15-185d-40d1-9125-4578f685e3b1','bb447281-8c82-458c-989f-a6a2ee10036a','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f5f0affa-cbcc-11f1-9946-00ff7cdd344a','4442fa15-185d-40d1-9125-4578f685e3b1','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f5f38b41-cbcc-11f1-9946-00ff7cdd344a','4442fa15-185d-40d1-9125-4578f685e3b1','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f5ff43dc-cbcc-11f1-9946-00ff7cdd344a','a94acd00-cff7-414a-828f-42d5f552e5b5','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f6034754-cbcc-11f1-9946-00ff7cdd344a','a94acd00-cff7-414a-828f-42d5f552e5b5','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f6066a27-cbcc-11f1-9946-00ff7cdd344a','a94acd00-cff7-414a-828f-42d5f552e5b5','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f61361ab-cbcc-11f1-9946-00ff7cdd344a','6126d4b3-d48b-457d-bf94-04a3ada05644','d432cb62-e40c-425d-a837-5bc9f42d9a74','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f618ccec-cbcc-11f1-9946-00ff7cdd344a','6126d4b3-d48b-457d-bf94-04a3ada05644','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f61c1ad7-cbcc-11f1-9946-00ff7cdd344a','6126d4b3-d48b-457d-bf94-04a3ada05644','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f62a033e-cbcc-11f1-9946-00ff7cdd344a','bcf492d8-4fd3-401c-aab3-0c89b46eb3a5','b92e7307-244a-449f-87fc-a12e872fead8','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:18'),('f62d88cb-cbcc-11f1-9946-00ff7cdd344a','bcf492d8-4fd3-401c-aab3-0c89b46eb3a5','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:18'),('f63075ef-cbcc-11f1-9946-00ff7cdd344a','bcf492d8-4fd3-401c-aab3-0c89b46eb3a5','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:18'),('f63d5d12-cbcc-11f1-9946-00ff7cdd344a','b5ee2e47-1c9d-4a3d-976b-34b4d87af4a8','e8a9a826-7820-47fa-86fe-cda0582071f9','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:19'),('f6414186-cbcc-11f1-9946-00ff7cdd344a','b5ee2e47-1c9d-4a3d-976b-34b4d87af4a8','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:19'),('f6448649-cbcc-11f1-9946-00ff7cdd344a','b5ee2e47-1c9d-4a3d-976b-34b4d87af4a8','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:19'),('f650675e-cbcc-11f1-9946-00ff7cdd344a','efdd75e0-0a9e-4a77-8ea5-d46c7fbcf69a','9a52ec9e-56ea-4d49-9e35-d294c7e48469','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:19'),('f65558e6-cbcc-11f1-9946-00ff7cdd344a','efdd75e0-0a9e-4a77-8ea5-d46c7fbcf69a','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:19'),('f6583543-cbcc-11f1-9946-00ff7cdd344a','efdd75e0-0a9e-4a77-8ea5-d46c7fbcf69a','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:19'),('f66444a2-cbcc-11f1-9946-00ff7cdd344a','bfe5336a-fdb7-4bf7-b99d-e730284d57e7','b977ac86-637a-44ee-a39d-d1b3fd292c11','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:19'),('f6677df5-cbcc-11f1-9946-00ff7cdd344a','bfe5336a-fdb7-4bf7-b99d-e730284d57e7','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:19'),('f66b104b-cbcc-11f1-9946-00ff7cdd344a','bfe5336a-fdb7-4bf7-b99d-e730284d57e7','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:19'),('f6783f2f-cbcc-11f1-9946-00ff7cdd344a','13a7b7b1-f6cd-48df-be1e-8eb91fbbffb1','015a9c77-da1f-4511-9239-1d76b9bd7ae2','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:19'),('f67d430e-cbcc-11f1-9946-00ff7cdd344a','13a7b7b1-f6cd-48df-be1e-8eb91fbbffb1','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-19 21:54:19'),('f680a1e9-cbcc-11f1-9946-00ff7cdd344a','13a7b7b1-f6cd-48df-be1e-8eb91fbbffb1','61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-19 21:54:19'),('f68df590-cbcc-11f1-9946-00ff7cdd344a','d55264ea-4e31-4340-8b0a-502379cf77c6','74d44da8-7c6c-423b-9013-58bf5ebeaa59','cho_xac_nhan','Tạo đơn hàng','2026-10-19 21:54:19'),('f691b6b0-cbcc-11f1-9946-00ff7cdd344a','d55264ea-4e31-4340-8b0a-502379cf77c6','74d44da8-7c6c-423b-9013-58bf5ebeaa59','da_huy','Chuyển từ cho_xac_nhan sang da_huy','2026-10-19 21:54:19'),('fb484603-c878-11f1-996e-00ff7cdd344a','661833b8-56a9-4b84-9cb0-e3702557a9d1','778316e4-bcad-4462-a653-67ae654984ad','da_xac_nhan','Chuyển từ cho_xac_nhan sang da_xac_nhan','2026-10-15 16:15:36'),('fc5825e8-c878-11f1-996e-00ff7cdd344a','661833b8-56a9-4b84-9cb0-e3702557a9d1','778316e4-bcad-4462-a653-67ae654984ad','dang_giao','Chuyển từ da_xac_nhan sang dang_giao','2026-10-15 16:15:38');
/*!40000 ALTER TABLE `lich_su_don_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loai_san_pham`
--

DROP TABLE IF EXISTS `loai_san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loai_san_pham` (
  `ma_loai_san_pham` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_loai_cha` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ten_loai_san_pham` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai` enum('hoat_dong','ngung_hoat_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  PRIMARY KEY (`ma_loai_san_pham`),
  KEY `idx_loai_cha` (`ma_loai_cha`),
  CONSTRAINT `fk_loai_cha` FOREIGN KEY (`ma_loai_cha`) REFERENCES `loai_san_pham` (`ma_loai_san_pham`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loai_san_pham`
--

LOCK TABLES `loai_san_pham` WRITE;
/*!40000 ALTER TABLE `loai_san_pham` DISABLE KEYS */;
INSERT INTO `loai_san_pham` VALUES ('14499fd6-7cbe-49e4-802a-7169ce9cf7cc',NULL,'Bánh Tráng',NULL,'hoat_dong'),('214db43a-8240-4541-81d2-09e66dedc867','14499fd6-7cbe-49e4-802a-7169ce9cf7cc','Bánh Tráng Khô',NULL,'hoat_dong'),('43f8079e-9ad4-4cd7-9527-4003755cda15','af2cdd93-2d95-4a8b-b882-df44cf198553','Khô bò',NULL,'hoat_dong'),('4e994d2b-fa57-44e3-848f-aae8f851df99',NULL,'Cơm Cháy',NULL,'hoat_dong'),('696addf0-cfe6-4321-8173-d731dd336980',NULL,'Da Heo',NULL,'hoat_dong'),('6cd5ed3f-0c5b-4246-9ea7-79968349fc14','af2cdd93-2d95-4a8b-b882-df44cf198553','Khô gà',NULL,'hoat_dong'),('9e4f8753-0472-4071-af7f-5860da7fbbd8','af2cdd93-2d95-4a8b-b882-df44cf198553','Khô Heo',NULL,'hoat_dong'),('acad93ab-e8f7-4e09-ad71-68829fabbdd2','14499fd6-7cbe-49e4-802a-7169ce9cf7cc','Bánh Tráng Phơi Sương',NULL,'hoat_dong'),('af2cdd93-2d95-4a8b-b882-df44cf198553',NULL,'Khô',NULL,'hoat_dong');
/*!40000 ALTER TABLE `loai_san_pham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nguoi_dung`
--

DROP TABLE IF EXISTS `nguoi_dung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoi_dung` (
  `ma_nguoi_dung` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ho_lot` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mat_khau` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dia_chi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vai_tro` enum('admin','nhan_vien','quan_ly','khach_hang') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'khach_hang',
  `trang_thai` enum('hoat_dong','ngung_hoat_dong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hoat_dong',
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_cap_nhat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_nguoi_dung`),
  UNIQUE KEY `uq_nguoi_dung_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoi_dung`
--

LOCK TABLES `nguoi_dung` WRITE;
/*!40000 ALTER TABLE `nguoi_dung` DISABLE KEYS */;
INSERT INTO `nguoi_dung` VALUES ('015a9c77-da1f-4511-9239-1d76b9bd7ae2','Hồ Văn','Khoa','khachhang9_7156@gmail.com','0919012349','123456','14 Đại lộ Hòa Bình, Phường Tân An, Quận Ninh Kiều, Cần Thơ','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('20846904-dcb9-4fa8-81d2-051fe335e10f','tran','Quản Lý','manager2@test.vn','0123456789','123456',NULL,'quan_ly','hoat_dong','2026-10-09 11:26:09','2026-10-09 11:26:09'),('246e3614-da3b-4302-b680-6e77499cf40b','Lê Hoàng','Long','khachhang3_7234@gmail.com','0983456783','123456','88 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('32d11e20-fb78-44b6-8165-58cf4eec4dcb','Nguyễn Minh','Tuấn','khachhang1_7234@gmail.com','0901234561','123456','12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('3a1a03cc-5482-4696-b6a8-077b13789d03','Đỗ Quỳnh','Chi','khachhang8_7234@gmail.com','0928901238','123456','67 Hoàng Hoa Thám, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('3bd1e802-3b54-4089-acc6-1cf1ee3080a7','Lê Hoàng','Long','khachhang3_7156@gmail.com','0983456783','123456','88 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('4a75753f-bebe-4d9b-a79d-79e2ebd84e53','Ngô Bảo','Châu','khachhang10_7234@gmail.com','0905123450','123456','52 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('4fe3aeb0-293d-44dc-a09f-bdcbaa8967ac','Nguyen Van','An','testmobile@gmail.com','0901234567','Password123!','123 Le Loi, Quan 1, TP.HCM','khach_hang','hoat_dong','2026-10-15 08:12:34','2026-10-15 08:12:34'),('5e1d4b47-b707-4b00-a6c1-b92d96b1e309','Nguyễn Minh','Tuấn','khachhang1_7156@gmail.com','0901234561','123456','12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('61cb52cd-bfba-11f1-9c79-7c4d8fa2a4f0','Nguyễn Văn','Quản Trị','admin@test.vn','0901234567','123456','Quận 1, TP. Hồ Chí Minh','admin','hoat_dong','2026-10-04 13:11:05','2026-10-04 13:11:05'),('6502853d-5e05-49ff-bc98-65305c76dcc4','Trần Thị','Mai','khachhang2_7234@gmail.com','0912345672','123456','45 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('6c0c2b2d-7ff0-48cc-81ad-97c4712ed484','Đặng Ngọc','Ánh','khachhang6_7234@gmail.com','0946789016','123456','36 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('72a979e1-2e79-488a-8a6c-24587143a07b','Độ','Mixi','customer@test.vn','0123456789','123456','66b nguyễn sy sách, Quận Tân Bình, Tp HCM','khach_hang','hoat_dong','2026-10-04 14:59:43','2026-10-22 09:55:29'),('74d44da8-7c6c-423b-9013-58bf5ebeaa59','Ngô Bảo','Châu','khachhang10_7156@gmail.com','0905123450','123456','52 Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('778316e4-bcad-4462-a653-67ae654984ad','tran','Nhân Viên','staff@test.com','0123456789','123456',NULL,'nhan_vien','hoat_dong','2026-10-04 14:11:38','2026-10-09 11:38:52'),('9a52ec9e-56ea-4d49-9e35-d294c7e48469','Bùi Thanh','Tùng','khachhang7_7156@gmail.com','0937890127','123456','209 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận, TP.HCM','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('a30fcfa3-a9bd-46ec-bc94-9f17213380f3','tran','Nhân Viên','staff2@test.vn','0123456789','123456',NULL,'nhan_vien','hoat_dong','2026-10-09 11:27:10','2026-10-09 11:27:10'),('afb71611-ff79-49f4-820f-de1d0caff48f','Bùi Thanh','Tùng','khachhang7_7234@gmail.com','0937890127','123456','209 Phan Đăng Lưu, Phường 1, Quận Phú Nhuận, TP.HCM','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('b0f5c951-ac55-4e69-b1a7-5d71d9e3ea3f','Nguyen','Customer','testcust@snackshop.vn','0912345678','123456','123 Duong Snack, Q1, HCM','khach_hang','hoat_dong','2026-10-10 09:46:46','2026-10-10 09:46:46'),('b92e7307-244a-449f-87fc-a12e872fead8','Vũ Đức','Anh','khachhang5_7156@gmail.com','0965678905','123456','15 Trần Phú, Phường Máy Tơ, Quận Ngô Quyền, Hải Phòng','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('b977ac86-637a-44ee-a39d-d1b3fd292c11','Đỗ Quỳnh','Chi','khachhang8_7156@gmail.com','0928901238','123456','67 Hoàng Hoa Thám, Phường Thụy Khuê, Quận Tây Hồ, Hà Nội','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('bb447281-8c82-458c-989f-a6a2ee10036a','Trần Thị','Mai','khachhang2_7156@gmail.com','0912345672','123456','45 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa','Phạm Thu','Hà','khachhang4_7234@gmail.com','0974567894','123456','102 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('c3126b7f-c03f-47a3-98ce-1af0612e7dd1','Nguyễn','Hoàng Nhật Anh','anhnguyenvn2005@gmail.com','0776825509','Nhatanh911.','361/19/32A Bình Đông, P15, Q8','khach_hang','hoat_dong','2026-10-22 10:40:54','2026-10-22 10:40:54'),('d15118ca-85ff-4c69-bea4-df6e39fd7a0d','Vũ Đức','Anh','khachhang5_7234@gmail.com','0965678905','123456','15 Trần Phú, Phường Máy Tơ, Quận Ngô Quyền, Hải Phòng','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('d432cb62-e40c-425d-a837-5bc9f42d9a74','Phạm Thu','Hà','khachhang4_7156@gmail.com','0974567894','123456','102 Hai Bà Trưng, Phường Tân Định, Quận 1, TP.HCM','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('da9082e3-4d77-4684-8a05-068fb882974e','Độ','Mixi','mixi@test.com',NULL,'123456','Quận 1','khach_hang','hoat_dong','2026-10-10 14:00:58','2026-10-10 14:00:57'),('df950492-81c5-4133-a11b-331c9f789fd9','Nguyễn Văn','Khách Đã Sửa','khach_1791519590974@gmail.com','0911223344','123456','Hải Phòng','khach_hang','hoat_dong','2026-10-09 11:19:51','2026-10-09 11:19:59'),('e2413c55-702c-439d-93e4-f55e3ff92722','Validator','Challenger','challenger1_test@example.com','0987654321','Test1234!',NULL,'khach_hang','hoat_dong','2026-10-19 21:10:28','2026-10-19 21:10:28'),('e8a9a826-7820-47fa-86fe-cda0582071f9','Đặng Ngọc','Ánh','khachhang6_7156@gmail.com','0946789016','123456','36 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng','khach_hang','hoat_dong','2026-10-19 21:54:17','2026-10-19 21:54:17'),('e9ee2035-fc61-455f-b578-024de1a9f0cb','Hồ Văn','Khoa','khachhang9_7234@gmail.com','0919012349','123456','14 Đại lộ Hòa Bình, Phường Tân An, Quận Ninh Kiều, Cần Thơ','khach_hang','hoat_dong','2026-10-19 21:53:27','2026-10-19 21:53:27'),('f8cafad3-a622-4afc-b4b9-e9f92bc03ac3','tran','Quản Lý','manager@test.vn','0123456789','123456',NULL,'quan_ly','hoat_dong','2026-10-04 14:52:40','2026-10-04 15:05:33');
/*!40000 ALTER TABLE `nguoi_dung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nha_cung_cap`
--

DROP TABLE IF EXISTS `nha_cung_cap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nha_cung_cap` (
  `ma_nha_cung_cap` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ten_nha_cung_cap` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dia_chi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`ma_nha_cung_cap`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nha_cung_cap`
--

LOCK TABLES `nha_cung_cap` WRITE;
/*!40000 ALTER TABLE `nha_cung_cap` DISABLE KEYS */;
INSERT INTO `nha_cung_cap` VALUES ('79e98706-5105-45b6-8305-0e1e07d5d096','Mixi Food','0123456789','bm@food.vn','ngõ 120 yên lãng, đống đa hà nội'),('7d08a898-02f2-40cd-a368-c526b20f88e0','Khô gà bà chiểu','0123456789','bachieu@khoga.vn','120 bà điểm quận 12');
/*!40000 ALTER TABLE `nha_cung_cap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhan_vien`
--

DROP TABLE IF EXISTS `nhan_vien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhan_vien` (
  `ma_nguoi_dung` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `muc_luong` decimal(15,2) NOT NULL DEFAULT '0.00',
  `ngay_vao_lam` date DEFAULT NULL,
  PRIMARY KEY (`ma_nguoi_dung`),
  CONSTRAINT `fk_nhan_vien_nguoi_dung` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE,
  CONSTRAINT `ck_nhan_vien_luong` CHECK ((`muc_luong` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhan_vien`
--

LOCK TABLES `nhan_vien` WRITE;
/*!40000 ALTER TABLE `nhan_vien` DISABLE KEYS */;
INSERT INTO `nhan_vien` VALUES ('20846904-dcb9-4fa8-81d2-051fe335e10f',15000000.00,'2026-10-10'),('778316e4-bcad-4462-a653-67ae654984ad',8000000.00,'2026-10-09'),('a30fcfa3-a9bd-46ec-bc94-9f17213380f3',7000000.00,'2026-10-09'),('f8cafad3-a622-4afc-b4b9-e9f92bc03ac3',15000000.00,'2026-10-09');
/*!40000 ALTER TABLE `nhan_vien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `san_pham`
--

DROP TABLE IF EXISTS `san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `san_pham` (
  `ma_san_pham` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_loai_san_pham` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_san_pham_cha` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ten_san_pham` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mo_ta` text COLLATE utf8mb4_unicode_ci,
  `don_vi_tinh` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gói',
  `khoi_luong` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gia_ban` decimal(15,2) NOT NULL,
  `so_luong_ton` int NOT NULL DEFAULT '0',
  `hinh_anh_dai_dien` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trang_thai` enum('dang_ban','ngung_ban') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dang_ban',
  PRIMARY KEY (`ma_san_pham`),
  KEY `idx_san_pham_loai` (`ma_loai_san_pham`),
  KEY `idx_san_pham_ten` (`ten_san_pham`),
  KEY `fk_san_pham_san_pham_cha` (`ma_san_pham_cha`),
  CONSTRAINT `fk_san_pham_loai` FOREIGN KEY (`ma_loai_san_pham`) REFERENCES `loai_san_pham` (`ma_loai_san_pham`),
  CONSTRAINT `fk_san_pham_san_pham_cha` FOREIGN KEY (`ma_san_pham_cha`) REFERENCES `san_pham` (`ma_san_pham`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ck_san_pham_gia` CHECK ((`gia_ban` >= 0)),
  CONSTRAINT `ck_san_pham_ton` CHECK ((`so_luong_ton` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `san_pham`
--

LOCK TABLES `san_pham` WRITE;
/*!40000 ALTER TABLE `san_pham` DISABLE KEYS */;
INSERT INTO `san_pham` VALUES ('042f1219-748e-4bb0-909b-d9f4ef857534','6cd5ed3f-0c5b-4246-9ea7-79968349fc14',NULL,'Khô Gà Lá Chanh','Khô gà lá chanh là món ăn vặt hấp dẫn với những sợi gà mềm dai, được tẩm ướp đậm đà cùng vị cay nhẹ và hương thơm đặc trưng của lá chanh.\nTừng sợi khô gà thơm lừng, đậm vị, càng nhai càng ngon, thích hợp để ăn vặt, xem phim, học tập hoặc nhâm nhi cùng bạn bè.','gói','150g',50000.00,384,'https://i.ibb.co/qMdPGF85/kho-ga-la-chanh.png','dang_ban'),('08bf092e-b1d5-4c48-b093-c252f9c8ccb5','9e4f8753-0472-4071-af7f-5860da7fbbd8',NULL,'Khô Heo Cay Tứ Xuyên - 25 gram',NULL,'gói','25g',20000.00,298,'https://i.ibb.co/WXcj2yh/kho-heo-cay-tu-xuyen.png','dang_ban'),('096cda99-6f3f-45b0-8a15-50b98f9f316c','6cd5ed3f-0c5b-4246-9ea7-79968349fc14','ed20534a-a811-4ea2-bf2a-b67c32a34bd8','Khô Gà Bơ Tỏi - Gói 500 gram',NULL,'hộp','500g',335000.00,400,'https://i.ibb.co/WNjq3gVd/kho-ga-bo-toi.png','dang_ban'),('0be6905f-fb99-4da7-9fdb-f1d95e5d343a','214db43a-8240-4541-81d2-09e66dedc867','276940fd-ae6f-4546-9c47-a704a0ce6171','Bánh Tráng Cuộn Muối Tép Tây Ninh - 200 gram',NULL,'bịch','200g',75000.00,300,'https://i.ibb.co/pv3Q08fx/banh-trang-cuon-muoi-tep-tay-ninh.png','dang_ban'),('0d29b96e-570a-46a6-99b1-7f8f59f2c50b','4e994d2b-fa57-44e3-848f-aae8f851df99',NULL,'Cơm Cháy Gạo Lức Rong Biển Chà Bông - 250 gram',NULL,'gói','250g',99000.00,289,'https://i.ibb.co/M56GdWPN/com-chay-gao-luc-rong-cha-bong.png','dang_ban'),('138755a4-1234-44aa-a175-9d981658d30b','9e4f8753-0472-4071-af7f-5860da7fbbd8','2f96fde0-8536-43d3-9fb2-b919306cfc1e','Khô Heo Cháy Tỏi - 200 gram',NULL,'gói','200g',95000.00,300,'https://i.ibb.co/srp4HD8/kho-heo-chay-toi.png','dang_ban'),('17580c91-02cb-4fdb-a35e-0d994923398e','4e994d2b-fa57-44e3-848f-aae8f851df99',NULL,'Cơm Cháy Chà Bông - 250 gram',NULL,'gói','250g',79000.00,295,'https://i.ibb.co/kVkKH1rx/com-chay-cha-bong.png','dang_ban'),('1895bdfc-2fd3-4e86-a7df-2bc2ab34c792','696addf0-cfe6-4321-8173-d731dd336980',NULL,'Da heo Lắc Mắm Hành - 200 gram',NULL,'lon','200g',79000.00,296,'https://i.ibb.co/BVcxjPth/da-heo-mam-hanh.png','dang_ban'),('19602eff-6304-43e2-8bb8-b1c09dbb17a7','214db43a-8240-4541-81d2-09e66dedc867',NULL,'Set Bánh Tráng Trộn',NULL,'gói',NULL,29000.00,296,'https://i.ibb.co/ccStX9tF/banh-trang-tu-tron.png','dang_ban'),('1a3dc39b-bccc-463e-a493-cb5a32b371f9','43f8079e-9ad4-4cd7-9527-4003755cda15','dd5188b1-d60e-4fee-aea6-c84d54672d21','Khô Bò Tẩm Vị - Gói 500 gram',NULL,'hộp','500g',580000.00,395,'https://i.ibb.co/fzQ8RZp8/kho-bo-mieng-gia-vi.png','dang_ban'),('1c96210f-aa89-4e0c-a1d8-0d3d0d799e1a','43f8079e-9ad4-4cd7-9527-4003755cda15','a22e8946-0fbf-4ab9-9261-786483d37c7d','Khô Bò Viên - Gói 200 gram',NULL,'lon',NULL,170000.00,300,'https://i.ibb.co/pvvtH0Q1/kho-bo-vien.png','dang_ban'),('209e287e-f0a3-4105-b5d3-cbb7014f41f8','acad93ab-e8f7-4e09-ad71-68829fabbdd2',NULL,'Bánh Tráng Muối Béo',NULL,'phần',NULL,55000.00,291,'https://i.ibb.co/67xJ1VxV/banh-trang-muoi-beo.png','dang_ban'),('2490aaa4-6273-42dd-8298-a57e57e477b8','6cd5ed3f-0c5b-4246-9ea7-79968349fc14','bda9a98b-1cba-4dcc-bf00-06ca8f736574','Khô Gà Cháy Tỏi - Hộp 500 gram',NULL,'hộp','500g',240000.00,487,'https://i.ibb.co/qYGHJ6m8/kho-ga-chay-toi.png','dang_ban'),('271f040a-e039-4fbe-ab4e-e4f91e312025','214db43a-8240-4541-81d2-09e66dedc867',NULL,'Bánh Tráng Cuốn Bơ',NULL,'phần',NULL,40000.00,292,'https://i.ibb.co/0RbZG0zC/banh-trang-cuon-bo.png','dang_ban'),('276940fd-ae6f-4546-9c47-a704a0ce6171','214db43a-8240-4541-81d2-09e66dedc867',NULL,'Bánh Tráng Cuộn Muối Tép Tây Ninh - 50 gram',NULL,'gói','50g',20000.00,273,'https://i.ibb.co/pv3Q08fx/banh-trang-cuon-muoi-tep-tay-ninh.png','dang_ban'),('2b22bedd-5397-414e-b2f7-1b104baea21c','9e4f8753-0472-4071-af7f-5860da7fbbd8','57decd03-37f8-420f-81fb-c6b0a90f5912','Khô Heo Miếng - 500 gram',NULL,'gói','500g',279000.00,300,'https://i.ibb.co/MxhcWKtW/kho-heo-mieng.png','dang_ban'),('2b9f9d85-7a53-41ef-b395-4fe78a5777d8','214db43a-8240-4541-81d2-09e66dedc867','448e3647-63f8-4351-a709-6f03e704ea82','Bánh Tráng Rong Biến Cháy Tỏi - 500 gram',NULL,'gói','500g',240000.00,300,'https://i.ibb.co/Kj5HqtsY/banh-trang-toi-rong-bien.png','dang_ban'),('2d5c7720-b613-45cc-8a2a-8682bc56d18e','696addf0-cfe6-4321-8173-d731dd336980',NULL,'Da heo Lắc Phô Mai - 200 gram',NULL,'lon','200g',89000.00,292,'https://i.ibb.co/7dL01bzC/da-heo-lac-pho-mai.png','dang_ban'),('2f6ab4b0-7c2f-4bf1-99b5-38fd42e8bdf3','43f8079e-9ad4-4cd7-9527-4003755cda15','dd5188b1-d60e-4fee-aea6-c84d54672d21','Khô Bò Tẩm Vị - Gói 150 gram',NULL,'gói','150g',170000.00,400,'https://i.ibb.co/fzQ8RZp8/kho-bo-mieng-gia-vi.png','dang_ban'),('2f96fde0-8536-43d3-9fb2-b919306cfc1e','9e4f8753-0472-4071-af7f-5860da7fbbd8',NULL,'Khô Heo Cháy Tỏi - 50 gram',NULL,'gói','50g',25000.00,292,'https://i.ibb.co/srp4HD8/kho-heo-chay-toi.png','dang_ban'),('3c090b57-c4f3-4b29-96e1-e36d1482e23a','696addf0-cfe6-4321-8173-d731dd336980','3c9367a9-9a32-495a-bb99-4043d16ee655','Da heo Lắc Tỏi Ớt - 500 gram',NULL,'hộp','500g',165000.00,300,'https://i.ibb.co/fGK6RGFL/da-heo-toi-ot.png','dang_ban'),('3c9367a9-9a32-495a-bb99-4043d16ee655','696addf0-cfe6-4321-8173-d731dd336980',NULL,'Da heo Lắc Tỏi Ớt - 200 gram',NULL,'lon','200g',69000.00,292,'https://i.ibb.co/fGK6RGFL/da-heo-toi-ot.png','dang_ban'),('448e3647-63f8-4351-a709-6f03e704ea82','214db43a-8240-4541-81d2-09e66dedc867',NULL,'Bánh Tráng Rong Biến Cháy Tỏi - 50 gram',NULL,'gói','50g',25000.00,291,'https://i.ibb.co/Kj5HqtsY/banh-trang-toi-rong-bien.png','dang_ban'),('4d6ace7c-8110-41ac-b4b3-7781148a402e','acad93ab-e8f7-4e09-ad71-68829fabbdd2',NULL,'Bánh Tráng Sate Muối Nhuyễn',NULL,'phần',NULL,49000.00,291,'https://i.ibb.co/MyyVHs3n/banh-trang-sate-muoi-toi.png','dang_ban'),('57decd03-37f8-420f-81fb-c6b0a90f5912','9e4f8753-0472-4071-af7f-5860da7fbbd8',NULL,'Khô Heo Miếng - 200 gram',NULL,'gói','200g',149000.00,298,'https://i.ibb.co/MxhcWKtW/kho-heo-mieng.png','dang_ban'),('5896494e-9b3f-456b-94c9-94286793c248','6cd5ed3f-0c5b-4246-9ea7-79968349fc14',NULL,'Khô Gà Rong Biển',NULL,'gói','150g',70000.00,400,'https://i.ibb.co/Tf324MQ/kho-ga-rong-bien.png','dang_ban'),('5f382eca-09f0-4ad4-9dd8-7816559b4d8d','696addf0-cfe6-4321-8173-d731dd336980','2d5c7720-b613-45cc-8a2a-8682bc56d18e','Da heo Lắc Phô Mai - 500 gram',NULL,'hộp','500g',219000.00,300,'https://i.ibb.co/7dL01bzC/da-heo-lac-pho-mai.png','dang_ban'),('6d75dd70-2f32-4e15-b1b5-4977a9a907ea','9e4f8753-0472-4071-af7f-5860da7fbbd8','08bf092e-b1d5-4c48-b093-c252f9c8ccb5','Khô Heo Cay Tứ Xuyên - 150 gram',NULL,'lon','150g',110000.00,300,'https://i.ibb.co/WXcj2yh/kho-heo-cay-tu-xuyen.png','dang_ban'),('7a8363ec-f617-4adb-9ab0-0e84e2144300','9e4f8753-0472-4071-af7f-5860da7fbbd8',NULL,'Khô Heo Sấy Cay - 200 gam',NULL,'lon','200g',129000.00,280,'https://i.ibb.co/spKxYqxn/kho-heo-say-cay.png','dang_ban'),('8bb63156-7706-4f2f-804e-45f006afe548','6cd5ed3f-0c5b-4246-9ea7-79968349fc14','042f1219-748e-4bb0-909b-d9f4ef857534','Khô Gà Lá Chanh - Gói 300 gram',NULL,'gói','300g',95000.00,400,'https://i.ibb.co/qMdPGF85/kho-ga-la-chanh.png','dang_ban'),('9997339f-7e3c-432c-9921-f48180c671cb','214db43a-8240-4541-81d2-09e66dedc867','276940fd-ae6f-4546-9c47-a704a0ce6171','Bánh Tráng Cuộn Muối Tép Tây Ninh - 500 gram',NULL,'bịch','500g',190000.00,300,'https://i.ibb.co/pv3Q08fx/banh-trang-cuon-muoi-tep-tay-ninh.png','dang_ban'),('9d886a7f-1355-4edb-98eb-7244c9042c28','6cd5ed3f-0c5b-4246-9ea7-79968349fc14','042f1219-748e-4bb0-909b-d9f4ef857534','Khô Gà Lá Chanh - Hũ 500 gram',NULL,'hũ','500g',160000.00,396,'https://i.ibb.co/qMdPGF85/kho-ga-la-chanh.png','dang_ban'),('a22e8946-0fbf-4ab9-9261-786483d37c7d','43f8079e-9ad4-4cd7-9527-4003755cda15',NULL,'Khô Bò Viên - Gói 50 gram',NULL,'gói','50g',45000.00,293,'https://i.ibb.co/pvvtH0Q1/kho-bo-vien.png','dang_ban'),('ac2237e0-5ac2-4c3d-aa35-c37b1fbdc8c7','43f8079e-9ad4-4cd7-9527-4003755cda15','a22e8946-0fbf-4ab9-9261-786483d37c7d','Khô Bò Viên - Gói 500 gram',NULL,'hộp','500g',430000.00,300,'https://i.ibb.co/pvvtH0Q1/kho-bo-vien.png','dang_ban'),('b01fb178-3ccc-405e-9ffc-77714e749857','6cd5ed3f-0c5b-4246-9ea7-79968349fc14','ed20534a-a811-4ea2-bf2a-b67c32a34bd8','Khô Gà Bơ Tỏi - Gói 200 gram',NULL,'gói','200g',65000.00,400,'https://i.ibb.co/WNjq3gVd/kho-ga-bo-toi.png','dang_ban'),('b4d8ea31-3f07-456f-be70-f54add2ad003','acad93ab-e8f7-4e09-ad71-68829fabbdd2',NULL,'Bánh tráng phơi sương bơ muôi tép hành phi',NULL,'phần',NULL,50000.00,292,'https://i.ibb.co/KpGNKvDB/banh-trang-bo-tep-hanh-phi.png','dang_ban'),('bd7f629e-4daa-4ede-8814-b7de0c614c0b','9e4f8753-0472-4071-af7f-5860da7fbbd8','2f96fde0-8536-43d3-9fb2-b919306cfc1e','Khô Heo Cháy Tỏi - 500 gram',NULL,'gói','500g',239000.00,300,'https://i.ibb.co/srp4HD8/kho-heo-chay-toi.png','dang_ban'),('bda9a98b-1cba-4dcc-bf00-06ca8f736574','6cd5ed3f-0c5b-4246-9ea7-79968349fc14',NULL,'Khô Gà Cháy Tỏi',NULL,'gói','150g',75000.00,383,'https://i.ibb.co/qYGHJ6m8/kho-ga-chay-toi.png','dang_ban'),('beace8e4-911e-419b-9fb0-574e920c5617','696addf0-cfe6-4321-8173-d731dd336980','1895bdfc-2fd3-4e86-a7df-2bc2ab34c792','Da heo Lắc Mắm Hành - 500 gram',NULL,'hộp','500g',189000.00,300,'https://i.ibb.co/BVcxjPth/da-heo-mam-hanh.png','dang_ban'),('c270ec91-4476-4f4c-9dc3-7dea27263d2d','6cd5ed3f-0c5b-4246-9ea7-79968349fc14','5896494e-9b3f-456b-94c9-94286793c248','Khô Gà Rong Biển - Hộp 500 gram',NULL,'hộp','500g',220000.00,400,'https://i.ibb.co/Tf324MQ/kho-ga-rong-bien.png','dang_ban'),('c30aacce-3aff-4f10-9286-029ff0e5a13e','6cd5ed3f-0c5b-4246-9ea7-79968349fc14','bda9a98b-1cba-4dcc-bf00-06ca8f736574','Khô Gà Cháy Tỏi - Gói 300 gram',NULL,'gói','300g',145000.00,500,'https://i.ibb.co/qYGHJ6m8/kho-ga-chay-toi.png','dang_ban'),('c7fb4e4f-ca24-4d60-b346-936babbf1e1d','214db43a-8240-4541-81d2-09e66dedc867','cdda2fe7-b650-494e-80f8-90f252f365bc','Bánh Tráng Phô Mai- 500 gram',NULL,'gói','500g',185000.00,295,'https://i.ibb.co/JRRggThM/banh-trang-pho-mai.png','dang_ban'),('c98553b6-c724-432a-86d9-0221ba4cf428','214db43a-8240-4541-81d2-09e66dedc867','cdda2fe7-b650-494e-80f8-90f252f365bc','Bánh Tráng Phô Mai- 200 gram',NULL,'bịch','200g',75000.00,300,'https://i.ibb.co/JRRggThM/banh-trang-pho-mai.png','dang_ban'),('cbb3a4ea-7cfc-4eaa-b5c4-c499e380705c','43f8079e-9ad4-4cd7-9527-4003755cda15','dd5188b1-d60e-4fee-aea6-c84d54672d21','Khô Bò Tẩm Vị - Gói 300 gram',NULL,'gói','300g',340000.00,400,'https://i.ibb.co/fzQ8RZp8/kho-bo-mieng-gia-vi.png','dang_ban'),('cdda2fe7-b650-494e-80f8-90f252f365bc','214db43a-8240-4541-81d2-09e66dedc867',NULL,'Bánh Tráng Phô Mai- 50 gram',NULL,'gói','50g',20000.00,294,'https://i.ibb.co/JRRggThM/banh-trang-pho-mai.png','dang_ban'),('d8bb42e2-bbd2-4f90-838f-eb5fc4d382c0','214db43a-8240-4541-81d2-09e66dedc867','448e3647-63f8-4351-a709-6f03e704ea82','Bánh Tráng Rong Biến Cháy Tỏi - 200 gram',NULL,'gói','200g',95000.00,300,'https://i.ibb.co/Kj5HqtsY/banh-trang-toi-rong-bien.png','dang_ban'),('d9926ce9-8bc8-4a49-add5-dc17d8248df6','6cd5ed3f-0c5b-4246-9ea7-79968349fc14','5896494e-9b3f-456b-94c9-94286793c248','Khô Gà Rong Biển - Gói 300 gram',NULL,'gói','300g',135000.00,395,'https://i.ibb.co/Tf324MQ/kho-ga-rong-bien.png','dang_ban'),('dd5188b1-d60e-4fee-aea6-c84d54672d21','43f8079e-9ad4-4cd7-9527-4003755cda15',NULL,'Khô Bò Tẩm Vị - Gói 50 gram',NULL,'gói','50g',60000.00,400,'https://i.ibb.co/fzQ8RZp8/kho-bo-mieng-gia-vi.png','dang_ban'),('de36ff01-0bc9-4cff-ab65-e2e0bae110ee','9e4f8753-0472-4071-af7f-5860da7fbbd8','08bf092e-b1d5-4c48-b093-c252f9c8ccb5','Khô Heo Cay Tứ Xuyên - 300 gram',NULL,'hộp','300g',209000.00,300,'https://i.ibb.co/WXcj2yh/kho-heo-cay-tu-xuyen.png','dang_ban'),('e7aeb13d-75e8-4e22-beec-7649135ab23b','9e4f8753-0472-4071-af7f-5860da7fbbd8','7a8363ec-f617-4adb-9ab0-0e84e2144300','Khô Heo Sấy Cay - 500 gam',NULL,'hộp',NULL,209000.00,300,'https://i.ibb.co/spKxYqxn/kho-heo-say-cay.png','dang_ban'),('e9d0f8f6-34ce-4100-bd79-a843c393d086','4e994d2b-fa57-44e3-848f-aae8f851df99',NULL,'Cơm Cháy Mắm Hành - 250 gram',NULL,'gói','250g',59000.00,298,'https://i.ibb.co/TD3wBPrJ/com-chay-mam-hanh.png','dang_ban'),('ed20534a-a811-4ea2-bf2a-b67c32a34bd8','6cd5ed3f-0c5b-4246-9ea7-79968349fc14',NULL,'Khô Gà Bơ Tỏi - Gói 100 gram',NULL,'gói','100g',35000.00,400,'https://i.ibb.co/WNjq3gVd/kho-ga-bo-toi.png','dang_ban');
/*!40000 ALTER TABLE `san_pham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thong_bao`
--

DROP TABLE IF EXISTS `thong_bao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thong_bao` (
  `ma_thong_bao` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ma_nguoi_dung` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tieu_de` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noi_dung` text COLLATE utf8mb4_unicode_ci,
  `da_doc` tinyint(1) NOT NULL DEFAULT '0',
  `ngay_tao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_thong_bao`),
  KEY `idx_thong_bao_nguoi_dung` (`ma_nguoi_dung`,`da_doc`),
  CONSTRAINT `fk_thong_bao_nguoi_dung` FOREIGN KEY (`ma_nguoi_dung`) REFERENCES `nguoi_dung` (`ma_nguoi_dung`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thong_bao`
--

LOCK TABLES `thong_bao` WRITE;
/*!40000 ALTER TABLE `thong_bao` DISABLE KEYS */;
INSERT INTO `thong_bao` VALUES ('1b3a5925-c455-11f1-a019-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Đặt hàng thành công','Đơn hàng DH20261010001 đã được tạo và đang chờ xác nhận.',1,'2026-10-10 09:48:43'),('2d564874-c482-11f1-a019-00ff7cdd344a','da9082e3-4d77-4684-8a05-068fb882974e','Đặt hàng thành công','Đơn hàng DH20261010003 đã được tạo và đang chờ xác nhận.',0,'2026-10-10 15:11:21'),('307a6bad-cdcd-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Đặt hàng thành công','Đơn hàng DH20261022003 đã được tạo và đang chờ xác nhận.',1,'2026-10-22 11:00:59'),('3227c61f-c836-11f1-bf6c-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Đặt hàng thành công','Đơn hàng DH20261015001 đã được tạo và đang chờ xác nhận.',1,'2026-10-15 08:17:32'),('327a4287-cbcd-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Cập nhật đơn hàng','Đơn hàng DH20261019028 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:56:00'),('327d6908-cbcd-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Cập nhật đơn hàng','Đơn hàng DH20261019028 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:56:00'),('393b7d8c-cdcd-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261022003 đã chuyển sang: Đã xác nhận (Bếp đang chuẩn bị món)',1,'2026-10-22 11:01:13'),('4c2e6cba-cdc9-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Đặt hàng thành công','Đơn hàng DH20261022001 đã được tạo và đang chờ xác nhận.',1,'2026-10-22 10:33:07'),('4f9b4b9d-cdcd-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261022003 đã chuyển sang: Đang giao hàng (Shipper đang đến)',1,'2026-10-22 11:01:51'),('52d45354-cdcd-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261022003 đã chuyển sang: Đã giao hàng thành công',1,'2026-10-22 11:01:56'),('6ef3c1fb-c482-11f1-a019-00ff7cdd344a','da9082e3-4d77-4684-8a05-068fb882974e','Cập nhật đơn hàng','Đơn hàng DH20261010003 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-10 15:13:11'),('7746aca3-cdc9-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261022001 chuyển sang trạng thái: Đã xác nhận',1,'2026-10-22 10:34:19'),('84cc4f6a-c47c-11f1-a019-00ff7cdd344a','da9082e3-4d77-4684-8a05-068fb882974e','Cập nhật đơn hàng','Đơn hàng DH20261010002 chuyển sang trạng thái: Đã xác nhận',1,'2026-10-10 14:30:50'),('85a43859-c47c-11f1-a019-00ff7cdd344a','da9082e3-4d77-4684-8a05-068fb882974e','Cập nhật đơn hàng','Đơn hàng DH20261010002 chuyển sang trạng thái: Đang giao hàng',1,'2026-10-10 14:30:52'),('86ba9bbb-c391-11f1-a019-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Đặt hàng thành công','Đơn hàng DH20261009001 đã được tạo và đang chờ xác nhận.',1,'2026-10-09 10:28:42'),('87167dbc-c47c-11f1-a019-00ff7cdd344a','da9082e3-4d77-4684-8a05-068fb882974e','Cập nhật đơn hàng','Đơn hàng DH20261010002 chuyển sang trạng thái: Đã giao hàng',1,'2026-10-10 14:30:54'),('8cc1f417-cdce-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Đặt hàng thành công','Đơn hàng DH20261022004 đã được tạo và đang chờ xác nhận.',1,'2026-10-22 11:10:43'),('8de03592-c478-11f1-a019-00ff7cdd344a','da9082e3-4d77-4684-8a05-068fb882974e','Đặt hàng thành công','Đơn hàng DH20261010002 đã được tạo và đang chờ xác nhận.',1,'2026-10-10 14:02:28'),('8e05323b-cdc9-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261015001 chuyển sang trạng thái: Đã giao hàng',1,'2026-10-22 10:34:57'),('96ce9294-cdca-11f1-8adc-00ff7cdd344a','c3126b7f-c03f-47a3-98ce-1af0612e7dd1','Đặt hàng thành công','Đơn hàng DH20261022002 đã được tạo và đang chờ xác nhận.',0,'2026-10-22 10:42:22'),('a64b49af-c485-11f1-a019-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261010001 chuyển sang trạng thái: Đã xác nhận',1,'2026-10-10 15:36:12'),('a6ecc529-c485-11f1-a019-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261010001 chuyển sang trạng thái: Đang giao hàng',1,'2026-10-10 15:36:13'),('a90e6bbf-cdc9-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261022001 chuyển sang trạng thái: Đang giao hàng',1,'2026-10-22 10:35:43'),('adcd3ded-c485-11f1-a019-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261010001 chuyển sang trạng thái: Đã giao hàng',1,'2026-10-10 15:36:25'),('b2538803-cbcd-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Cập nhật đơn hàng','Đơn hàng DH20261019049 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-19 21:59:34'),('b2aca0c8-c485-11f1-a019-00ff7cdd344a','da9082e3-4d77-4684-8a05-068fb882974e','Cập nhật đơn hàng','Đơn hàng DH20261010003 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-10 15:36:33'),('b3261944-cdc9-11f1-8adc-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261022001 chuyển sang trạng thái: Đã giao hàng',1,'2026-10-22 10:36:00'),('b4150151-c485-11f1-a019-00ff7cdd344a','da9082e3-4d77-4684-8a05-068fb882974e','Cập nhật đơn hàng','Đơn hàng DH20261010003 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-10 15:36:35'),('c0af9d12-cbcd-11f1-9946-00ff7cdd344a','d432cb62-e40c-425d-a837-5bc9f42d9a74','Cập nhật đơn hàng','Đơn hàng DH20261019044 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-19 21:59:58'),('c0c9f432-cbcd-11f1-9946-00ff7cdd344a','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','Cập nhật đơn hàng','Đơn hàng DH20261019043 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-19 21:59:58'),('c0e10408-cbcd-11f1-9946-00ff7cdd344a','e8a9a826-7820-47fa-86fe-cda0582071f9','Cập nhật đơn hàng','Đơn hàng DH20261019046 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-19 21:59:58'),('c0f1cc55-cbcd-11f1-9946-00ff7cdd344a','b92e7307-244a-449f-87fc-a12e872fead8','Cập nhật đơn hàng','Đơn hàng DH20261019045 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-19 21:59:59'),('c101ff15-cbcd-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Cập nhật đơn hàng','Đơn hàng DH20261019048 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-19 21:59:59'),('c11217e0-cbcd-11f1-9946-00ff7cdd344a','9a52ec9e-56ea-4d49-9e35-d294c7e48469','Cập nhật đơn hàng','Đơn hàng DH20261019047 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-19 21:59:59'),('c123cb08-cbcd-11f1-9946-00ff7cdd344a','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','Cập nhật đơn hàng','Đơn hàng DH20261019041 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-19 21:59:59'),('c1358c66-cbcd-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Cập nhật đơn hàng','Đơn hàng DH20261019039 chuyển sang trạng thái: Đã giao hàng',0,'2026-10-19 21:59:59'),('d7b6d7da-cbcc-11f1-9946-00ff7cdd344a','6502853d-5e05-49ff-bc98-65305c76dcc4','Đặt hàng thành công','Đơn hàng DH20261019001 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:27'),('d7d6130a-cbcc-11f1-9946-00ff7cdd344a','246e3614-da3b-4302-b680-6e77499cf40b','Đặt hàng thành công','Đơn hàng DH20261019002 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d7ddaed3-cbcc-11f1-9946-00ff7cdd344a','d15118ca-85ff-4c69-bea4-df6e39fd7a0d','Đặt hàng thành công','Đơn hàng DH20261019003 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d7e36040-cbcc-11f1-9946-00ff7cdd344a','6c0c2b2d-7ff0-48cc-81ad-97c4712ed484','Đặt hàng thành công','Đơn hàng DH20261019004 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d7ea5398-cbcc-11f1-9946-00ff7cdd344a','3a1a03cc-5482-4696-b6a8-077b13789d03','Đặt hàng thành công','Đơn hàng DH20261019005 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d7ef7f26-cbcc-11f1-9946-00ff7cdd344a','e9ee2035-fc61-455f-b578-024de1a9f0cb','Đặt hàng thành công','Đơn hàng DH20261019006 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d7f6d859-cbcc-11f1-9946-00ff7cdd344a','e9ee2035-fc61-455f-b578-024de1a9f0cb','Cập nhật đơn hàng','Đơn hàng DH20261019006 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:28'),('d7fd722e-cbcc-11f1-9946-00ff7cdd344a','32d11e20-fb78-44b6-8165-58cf4eec4dcb','Đặt hàng thành công','Đơn hàng DH20261019007 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d8020397-cbcc-11f1-9946-00ff7cdd344a','32d11e20-fb78-44b6-8165-58cf4eec4dcb','Cập nhật đơn hàng','Đơn hàng DH20261019007 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:28'),('d806abbd-cbcc-11f1-9946-00ff7cdd344a','6502853d-5e05-49ff-bc98-65305c76dcc4','Đặt hàng thành công','Đơn hàng DH20261019008 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d80ceea9-cbcc-11f1-9946-00ff7cdd344a','6502853d-5e05-49ff-bc98-65305c76dcc4','Cập nhật đơn hàng','Đơn hàng DH20261019008 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:28'),('d81331b5-cbcc-11f1-9946-00ff7cdd344a','c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa','Đặt hàng thành công','Đơn hàng DH20261019009 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d8172c66-cbcc-11f1-9946-00ff7cdd344a','c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa','Cập nhật đơn hàng','Đơn hàng DH20261019009 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:28'),('d81b8adb-cbcc-11f1-9946-00ff7cdd344a','d15118ca-85ff-4c69-bea4-df6e39fd7a0d','Đặt hàng thành công','Đơn hàng DH20261019010 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d81f714b-cbcc-11f1-9946-00ff7cdd344a','d15118ca-85ff-4c69-bea4-df6e39fd7a0d','Cập nhật đơn hàng','Đơn hàng DH20261019010 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:28'),('d822adfc-cbcc-11f1-9946-00ff7cdd344a','d15118ca-85ff-4c69-bea4-df6e39fd7a0d','Cập nhật đơn hàng','Đơn hàng DH20261019010 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:28'),('d828aeb9-cbcc-11f1-9946-00ff7cdd344a','afb71611-ff79-49f4-820f-de1d0caff48f','Đặt hàng thành công','Đơn hàng DH20261019011 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d82cd5e6-cbcc-11f1-9946-00ff7cdd344a','afb71611-ff79-49f4-820f-de1d0caff48f','Cập nhật đơn hàng','Đơn hàng DH20261019011 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:28'),('d8301f76-cbcc-11f1-9946-00ff7cdd344a','afb71611-ff79-49f4-820f-de1d0caff48f','Cập nhật đơn hàng','Đơn hàng DH20261019011 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:28'),('d8348560-cbcc-11f1-9946-00ff7cdd344a','3a1a03cc-5482-4696-b6a8-077b13789d03','Đặt hàng thành công','Đơn hàng DH20261019012 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d838dce4-cbcc-11f1-9946-00ff7cdd344a','3a1a03cc-5482-4696-b6a8-077b13789d03','Cập nhật đơn hàng','Đơn hàng DH20261019012 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:28'),('d83ccd9c-cbcc-11f1-9946-00ff7cdd344a','3a1a03cc-5482-4696-b6a8-077b13789d03','Cập nhật đơn hàng','Đơn hàng DH20261019012 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:28'),('d84315da-cbcc-11f1-9946-00ff7cdd344a','4a75753f-bebe-4d9b-a79d-79e2ebd84e53','Đặt hàng thành công','Đơn hàng DH20261019013 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d84715f8-cbcc-11f1-9946-00ff7cdd344a','4a75753f-bebe-4d9b-a79d-79e2ebd84e53','Cập nhật đơn hàng','Đơn hàng DH20261019013 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:28'),('d84a6167-cbcc-11f1-9946-00ff7cdd344a','4a75753f-bebe-4d9b-a79d-79e2ebd84e53','Cập nhật đơn hàng','Đơn hàng DH20261019013 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:28'),('d84eba7c-cbcc-11f1-9946-00ff7cdd344a','32d11e20-fb78-44b6-8165-58cf4eec4dcb','Đặt hàng thành công','Đơn hàng DH20261019014 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:28'),('d852b617-cbcc-11f1-9946-00ff7cdd344a','32d11e20-fb78-44b6-8165-58cf4eec4dcb','Cập nhật đơn hàng','Đơn hàng DH20261019014 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:28'),('d855e2b9-cbcc-11f1-9946-00ff7cdd344a','32d11e20-fb78-44b6-8165-58cf4eec4dcb','Cập nhật đơn hàng','Đơn hàng DH20261019014 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:28'),('d86e2a03-cbcc-11f1-9946-00ff7cdd344a','246e3614-da3b-4302-b680-6e77499cf40b','Đặt hàng thành công','Đơn hàng DH20261019015 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:29'),('d8722138-cbcc-11f1-9946-00ff7cdd344a','246e3614-da3b-4302-b680-6e77499cf40b','Cập nhật đơn hàng','Đơn hàng DH20261019015 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:29'),('d8753c2a-cbcc-11f1-9946-00ff7cdd344a','246e3614-da3b-4302-b680-6e77499cf40b','Cập nhật đơn hàng','Đơn hàng DH20261019015 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:29'),('d8847662-cbcc-11f1-9946-00ff7cdd344a','c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa','Đặt hàng thành công','Đơn hàng DH20261019016 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:29'),('d88899bd-cbcc-11f1-9946-00ff7cdd344a','c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa','Cập nhật đơn hàng','Đơn hàng DH20261019016 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:29'),('d88bcc37-cbcc-11f1-9946-00ff7cdd344a','c0e6d2fc-0ad1-4c28-bee4-d4cdc41e46fa','Cập nhật đơn hàng','Đơn hàng DH20261019016 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:29'),('d89cea94-cbcc-11f1-9946-00ff7cdd344a','6c0c2b2d-7ff0-48cc-81ad-97c4712ed484','Đặt hàng thành công','Đơn hàng DH20261019017 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:29'),('d8a206e3-cbcc-11f1-9946-00ff7cdd344a','6c0c2b2d-7ff0-48cc-81ad-97c4712ed484','Cập nhật đơn hàng','Đơn hàng DH20261019017 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:29'),('d8a5c54e-cbcc-11f1-9946-00ff7cdd344a','6c0c2b2d-7ff0-48cc-81ad-97c4712ed484','Cập nhật đơn hàng','Đơn hàng DH20261019017 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:29'),('d8b4ebc5-cbcc-11f1-9946-00ff7cdd344a','afb71611-ff79-49f4-820f-de1d0caff48f','Đặt hàng thành công','Đơn hàng DH20261019018 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:29'),('d8b90a28-cbcc-11f1-9946-00ff7cdd344a','afb71611-ff79-49f4-820f-de1d0caff48f','Cập nhật đơn hàng','Đơn hàng DH20261019018 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:29'),('d8bcf96e-cbcc-11f1-9946-00ff7cdd344a','afb71611-ff79-49f4-820f-de1d0caff48f','Cập nhật đơn hàng','Đơn hàng DH20261019018 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:29'),('d8cce24c-cbcc-11f1-9946-00ff7cdd344a','e9ee2035-fc61-455f-b578-024de1a9f0cb','Đặt hàng thành công','Đơn hàng DH20261019019 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:29'),('d8d11f1a-cbcc-11f1-9946-00ff7cdd344a','e9ee2035-fc61-455f-b578-024de1a9f0cb','Cập nhật đơn hàng','Đơn hàng DH20261019019 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:53:29'),('d8d4c0f9-cbcc-11f1-9946-00ff7cdd344a','e9ee2035-fc61-455f-b578-024de1a9f0cb','Cập nhật đơn hàng','Đơn hàng DH20261019019 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:53:29'),('d8e4407c-cbcc-11f1-9946-00ff7cdd344a','4a75753f-bebe-4d9b-a79d-79e2ebd84e53','Đặt hàng thành công','Đơn hàng DH20261019020 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:53:29'),('d8e98884-cbcc-11f1-9946-00ff7cdd344a','4a75753f-bebe-4d9b-a79d-79e2ebd84e53','Cập nhật đơn hàng','Đơn hàng DH20261019020 chuyển sang trạng thái: Đã hủy',0,'2026-10-19 21:53:29'),('d92d0909-c485-11f1-a019-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261009001 chuyển sang trạng thái: Đã xác nhận',1,'2026-10-10 15:37:37'),('d9ddb2d7-c485-11f1-a019-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261009001 chuyển sang trạng thái: Đang giao hàng',1,'2026-10-10 15:37:39'),('db4921af-c485-11f1-a019-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261009001 chuyển sang trạng thái: Đã giao hàng',1,'2026-10-10 15:37:41'),('f53fc7c2-cbcc-11f1-9946-00ff7cdd344a','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','Đặt hàng thành công','Đơn hàng DH20261019021 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f5488081-cbcc-11f1-9946-00ff7cdd344a','bb447281-8c82-458c-989f-a6a2ee10036a','Đặt hàng thành công','Đơn hàng DH20261019022 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f54db9f3-cbcc-11f1-9946-00ff7cdd344a','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','Đặt hàng thành công','Đơn hàng DH20261019023 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f5520145-cbcc-11f1-9946-00ff7cdd344a','d432cb62-e40c-425d-a837-5bc9f42d9a74','Đặt hàng thành công','Đơn hàng DH20261019024 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f5564606-cbcc-11f1-9946-00ff7cdd344a','b92e7307-244a-449f-87fc-a12e872fead8','Đặt hàng thành công','Đơn hàng DH20261019025 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f55ac845-cbcc-11f1-9946-00ff7cdd344a','e8a9a826-7820-47fa-86fe-cda0582071f9','Đặt hàng thành công','Đơn hàng DH20261019026 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f55f6617-cbcc-11f1-9946-00ff7cdd344a','9a52ec9e-56ea-4d49-9e35-d294c7e48469','Đặt hàng thành công','Đơn hàng DH20261019027 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f56375ef-cbcc-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Đặt hàng thành công','Đơn hàng DH20261019028 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f567fcd2-cbcc-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Đặt hàng thành công','Đơn hàng DH20261019029 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f56c7667-cbcc-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Cập nhật đơn hàng','Đơn hàng DH20261019029 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:17'),('f570bda3-cbcc-11f1-9946-00ff7cdd344a','74d44da8-7c6c-423b-9013-58bf5ebeaa59','Đặt hàng thành công','Đơn hàng DH20261019030 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f574784c-cbcc-11f1-9946-00ff7cdd344a','74d44da8-7c6c-423b-9013-58bf5ebeaa59','Cập nhật đơn hàng','Đơn hàng DH20261019030 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:17'),('f5788eb4-cbcc-11f1-9946-00ff7cdd344a','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','Đặt hàng thành công','Đơn hàng DH20261019031 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f57c6513-cbcc-11f1-9946-00ff7cdd344a','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','Cập nhật đơn hàng','Đơn hàng DH20261019031 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:17'),('f5804f7d-cbcc-11f1-9946-00ff7cdd344a','bb447281-8c82-458c-989f-a6a2ee10036a','Đặt hàng thành công','Đơn hàng DH20261019032 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f5849fb3-cbcc-11f1-9946-00ff7cdd344a','bb447281-8c82-458c-989f-a6a2ee10036a','Cập nhật đơn hàng','Đơn hàng DH20261019032 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:17'),('f588b444-cbcc-11f1-9946-00ff7cdd344a','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','Đặt hàng thành công','Đơn hàng DH20261019033 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f58c7430-cbcc-11f1-9946-00ff7cdd344a','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','Cập nhật đơn hàng','Đơn hàng DH20261019033 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:17'),('f591d704-cbcc-11f1-9946-00ff7cdd344a','d432cb62-e40c-425d-a837-5bc9f42d9a74','Đặt hàng thành công','Đơn hàng DH20261019034 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f595e3b1-cbcc-11f1-9946-00ff7cdd344a','d432cb62-e40c-425d-a837-5bc9f42d9a74','Cập nhật đơn hàng','Đơn hàng DH20261019034 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:17'),('f599ebf0-cbcc-11f1-9946-00ff7cdd344a','b92e7307-244a-449f-87fc-a12e872fead8','Đặt hàng thành công','Đơn hàng DH20261019035 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:17'),('f59dbcc0-cbcc-11f1-9946-00ff7cdd344a','b92e7307-244a-449f-87fc-a12e872fead8','Cập nhật đơn hàng','Đơn hàng DH20261019035 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:17'),('f5a0cc0f-cbcc-11f1-9946-00ff7cdd344a','b92e7307-244a-449f-87fc-a12e872fead8','Cập nhật đơn hàng','Đơn hàng DH20261019035 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:17'),('f5a4a78a-cbcc-11f1-9946-00ff7cdd344a','e8a9a826-7820-47fa-86fe-cda0582071f9','Đặt hàng thành công','Đơn hàng DH20261019036 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f5a81513-cbcc-11f1-9946-00ff7cdd344a','e8a9a826-7820-47fa-86fe-cda0582071f9','Cập nhật đơn hàng','Đơn hàng DH20261019036 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f5aaf8c7-cbcc-11f1-9946-00ff7cdd344a','e8a9a826-7820-47fa-86fe-cda0582071f9','Cập nhật đơn hàng','Đơn hàng DH20261019036 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f5af7b9d-cbcc-11f1-9946-00ff7cdd344a','9a52ec9e-56ea-4d49-9e35-d294c7e48469','Đặt hàng thành công','Đơn hàng DH20261019037 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f5b35c22-cbcc-11f1-9946-00ff7cdd344a','9a52ec9e-56ea-4d49-9e35-d294c7e48469','Cập nhật đơn hàng','Đơn hàng DH20261019037 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f5b66f33-cbcc-11f1-9946-00ff7cdd344a','9a52ec9e-56ea-4d49-9e35-d294c7e48469','Cập nhật đơn hàng','Đơn hàng DH20261019037 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f5ba7e57-cbcc-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Đặt hàng thành công','Đơn hàng DH20261019038 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f5be4383-cbcc-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Cập nhật đơn hàng','Đơn hàng DH20261019038 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f5c14732-cbcc-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Cập nhật đơn hàng','Đơn hàng DH20261019038 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f5c4e16f-cbcc-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Đặt hàng thành công','Đơn hàng DH20261019039 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f5c7efd0-cbcc-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Cập nhật đơn hàng','Đơn hàng DH20261019039 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f5cb4a72-cbcc-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Cập nhật đơn hàng','Đơn hàng DH20261019039 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f5cf3143-cbcc-11f1-9946-00ff7cdd344a','74d44da8-7c6c-423b-9013-58bf5ebeaa59','Đặt hàng thành công','Đơn hàng DH20261019040 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f5d2a9b7-cbcc-11f1-9946-00ff7cdd344a','74d44da8-7c6c-423b-9013-58bf5ebeaa59','Cập nhật đơn hàng','Đơn hàng DH20261019040 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f5d581bc-cbcc-11f1-9946-00ff7cdd344a','74d44da8-7c6c-423b-9013-58bf5ebeaa59','Cập nhật đơn hàng','Đơn hàng DH20261019040 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f5d9814f-cbcc-11f1-9946-00ff7cdd344a','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','Đặt hàng thành công','Đơn hàng DH20261019041 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f5dd3d1e-cbcc-11f1-9946-00ff7cdd344a','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','Cập nhật đơn hàng','Đơn hàng DH20261019041 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f5e04039-cbcc-11f1-9946-00ff7cdd344a','5e1d4b47-b707-4b00-a6c1-b92d96b1e309','Cập nhật đơn hàng','Đơn hàng DH20261019041 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f5ed4ee6-cbcc-11f1-9946-00ff7cdd344a','bb447281-8c82-458c-989f-a6a2ee10036a','Đặt hàng thành công','Đơn hàng DH20261019042 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f5f0b5f1-cbcc-11f1-9946-00ff7cdd344a','bb447281-8c82-458c-989f-a6a2ee10036a','Cập nhật đơn hàng','Đơn hàng DH20261019042 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f5f38eb2-cbcc-11f1-9946-00ff7cdd344a','bb447281-8c82-458c-989f-a6a2ee10036a','Cập nhật đơn hàng','Đơn hàng DH20261019042 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f5ff47ff-cbcc-11f1-9946-00ff7cdd344a','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','Đặt hàng thành công','Đơn hàng DH20261019043 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f6034d0b-cbcc-11f1-9946-00ff7cdd344a','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','Cập nhật đơn hàng','Đơn hàng DH20261019043 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f6066dd2-cbcc-11f1-9946-00ff7cdd344a','3bd1e802-3b54-4089-acc6-1cf1ee3080a7','Cập nhật đơn hàng','Đơn hàng DH20261019043 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f6136609-cbcc-11f1-9946-00ff7cdd344a','d432cb62-e40c-425d-a837-5bc9f42d9a74','Đặt hàng thành công','Đơn hàng DH20261019044 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f618d1e1-cbcc-11f1-9946-00ff7cdd344a','d432cb62-e40c-425d-a837-5bc9f42d9a74','Cập nhật đơn hàng','Đơn hàng DH20261019044 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f61c24bc-cbcc-11f1-9946-00ff7cdd344a','d432cb62-e40c-425d-a837-5bc9f42d9a74','Cập nhật đơn hàng','Đơn hàng DH20261019044 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f62a0611-cbcc-11f1-9946-00ff7cdd344a','b92e7307-244a-449f-87fc-a12e872fead8','Đặt hàng thành công','Đơn hàng DH20261019045 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:18'),('f62d8e96-cbcc-11f1-9946-00ff7cdd344a','b92e7307-244a-449f-87fc-a12e872fead8','Cập nhật đơn hàng','Đơn hàng DH20261019045 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:18'),('f63079ce-cbcc-11f1-9946-00ff7cdd344a','b92e7307-244a-449f-87fc-a12e872fead8','Cập nhật đơn hàng','Đơn hàng DH20261019045 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:18'),('f63d5fe9-cbcc-11f1-9946-00ff7cdd344a','e8a9a826-7820-47fa-86fe-cda0582071f9','Đặt hàng thành công','Đơn hàng DH20261019046 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:19'),('f6414549-cbcc-11f1-9946-00ff7cdd344a','e8a9a826-7820-47fa-86fe-cda0582071f9','Cập nhật đơn hàng','Đơn hàng DH20261019046 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:19'),('f6449078-cbcc-11f1-9946-00ff7cdd344a','e8a9a826-7820-47fa-86fe-cda0582071f9','Cập nhật đơn hàng','Đơn hàng DH20261019046 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:19'),('f6506ba2-cbcc-11f1-9946-00ff7cdd344a','9a52ec9e-56ea-4d49-9e35-d294c7e48469','Đặt hàng thành công','Đơn hàng DH20261019047 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:19'),('f6555c6c-cbcc-11f1-9946-00ff7cdd344a','9a52ec9e-56ea-4d49-9e35-d294c7e48469','Cập nhật đơn hàng','Đơn hàng DH20261019047 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:19'),('f6583cfc-cbcc-11f1-9946-00ff7cdd344a','9a52ec9e-56ea-4d49-9e35-d294c7e48469','Cập nhật đơn hàng','Đơn hàng DH20261019047 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:19'),('f6644802-cbcc-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Đặt hàng thành công','Đơn hàng DH20261019048 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:19'),('f667865c-cbcc-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Cập nhật đơn hàng','Đơn hàng DH20261019048 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:19'),('f66b16c9-cbcc-11f1-9946-00ff7cdd344a','b977ac86-637a-44ee-a39d-d1b3fd292c11','Cập nhật đơn hàng','Đơn hàng DH20261019048 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:19'),('f678437e-cbcc-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Đặt hàng thành công','Đơn hàng DH20261019049 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:19'),('f67d48eb-cbcc-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Cập nhật đơn hàng','Đơn hàng DH20261019049 chuyển sang trạng thái: Đã xác nhận',0,'2026-10-19 21:54:19'),('f680a786-cbcc-11f1-9946-00ff7cdd344a','015a9c77-da1f-4511-9239-1d76b9bd7ae2','Cập nhật đơn hàng','Đơn hàng DH20261019049 chuyển sang trạng thái: Đang giao hàng',0,'2026-10-19 21:54:19'),('f68dfa66-cbcc-11f1-9946-00ff7cdd344a','74d44da8-7c6c-423b-9013-58bf5ebeaa59','Đặt hàng thành công','Đơn hàng DH20261019050 đã được tạo và đang chờ xác nhận.',0,'2026-10-19 21:54:19'),('f691ba2d-cbcc-11f1-9946-00ff7cdd344a','74d44da8-7c6c-423b-9013-58bf5ebeaa59','Cập nhật đơn hàng','Đơn hàng DH20261019050 chuyển sang trạng thái: Đã hủy',0,'2026-10-19 21:54:19'),('fb48a896-c878-11f1-996e-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261015001 chuyển sang trạng thái: Đã xác nhận',1,'2026-10-15 16:15:36'),('fc582ac4-c878-11f1-996e-00ff7cdd344a','72a979e1-2e79-488a-8a6c-24587143a07b','Cập nhật đơn hàng','Đơn hàng DH20261015001 chuyển sang trạng thái: Đang giao hàng',1,'2026-10-15 16:15:38');
/*!40000 ALTER TABLE `thong_bao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_doanh_thu_theo_thang`
--

DROP TABLE IF EXISTS `v_doanh_thu_theo_thang`;
/*!50001 DROP VIEW IF EXISTS `v_doanh_thu_theo_thang`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_doanh_thu_theo_thang` AS SELECT 
 1 AS `thang`,
 1 AS `so_don`,
 1 AS `doanh_thu`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_don_hang_tong_hop`
--

DROP TABLE IF EXISTS `v_don_hang_tong_hop`;
/*!50001 DROP VIEW IF EXISTS `v_don_hang_tong_hop`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_don_hang_tong_hop` AS SELECT 
 1 AS `ma_don_hang`,
 1 AS `ma_code`,
 1 AS `ten_khach_hang`,
 1 AS `ten_nguoi_nhan`,
 1 AS `tien_hang`,
 1 AS `phi_van_chuyen`,
 1 AS `tien_giam_gia`,
 1 AS `tong_tien_thanh_toan`,
 1 AS `phuong_thuc_thanh_toan`,
 1 AS `trang_thai_thanh_toan`,
 1 AS `trang_thai_don_hang`,
 1 AS `ngay_tao`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_san_pham_ban_chay`
--

DROP TABLE IF EXISTS `v_san_pham_ban_chay`;
/*!50001 DROP VIEW IF EXISTS `v_san_pham_ban_chay`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_san_pham_ban_chay` AS SELECT 
 1 AS `ma_san_pham`,
 1 AS `ten_san_pham`,
 1 AS `tong_so_luong_ban`,
 1 AS `tong_doanh_thu`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_san_pham_hien_thi`
--

DROP TABLE IF EXISTS `v_san_pham_hien_thi`;
/*!50001 DROP VIEW IF EXISTS `v_san_pham_hien_thi`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_san_pham_hien_thi` AS SELECT 
 1 AS `ma_san_pham`,
 1 AS `ten_san_pham`,
 1 AS `ten_loai_san_pham`,
 1 AS `don_vi_tinh`,
 1 AS `gia_ban`,
 1 AS `so_luong_ton`,
 1 AS `trang_thai`,
 1 AS `diem_trung_binh`,
 1 AS `so_danh_gia`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_san_pham_sap_het_hang`
--

DROP TABLE IF EXISTS `v_san_pham_sap_het_hang`;
/*!50001 DROP VIEW IF EXISTS `v_san_pham_sap_het_hang`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_san_pham_sap_het_hang` AS SELECT 
 1 AS `ma_san_pham`,
 1 AS `ten_san_pham`,
 1 AS `don_vi_tinh`,
 1 AS `so_luong_ton`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'snack_shop'
--

--
-- Dumping routines for database 'snack_shop'
--

--
-- Final view structure for view `v_doanh_thu_theo_thang`
--

/*!50001 DROP VIEW IF EXISTS `v_doanh_thu_theo_thang`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_doanh_thu_theo_thang` AS select date_format(`don_hang`.`ngay_tao`,'%Y-%m') AS `thang`,count(0) AS `so_don`,sum(`don_hang`.`tong_tien_thanh_toan`) AS `doanh_thu` from `don_hang` where (`don_hang`.`trang_thai_don_hang` = 'da_giao') group by date_format(`don_hang`.`ngay_tao`,'%Y-%m') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_don_hang_tong_hop`
--

/*!50001 DROP VIEW IF EXISTS `v_don_hang_tong_hop`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_don_hang_tong_hop` AS select `dh`.`ma_don_hang` AS `ma_don_hang`,`dh`.`ma_code` AS `ma_code`,concat(`nd`.`ho_lot`,' ',`nd`.`ten`) AS `ten_khach_hang`,`dh`.`ten_nguoi_nhan` AS `ten_nguoi_nhan`,`dh`.`tien_hang` AS `tien_hang`,`dh`.`phi_van_chuyen` AS `phi_van_chuyen`,`dh`.`tien_giam_gia` AS `tien_giam_gia`,`dh`.`tong_tien_thanh_toan` AS `tong_tien_thanh_toan`,`dh`.`phuong_thuc_thanh_toan` AS `phuong_thuc_thanh_toan`,`dh`.`trang_thai_thanh_toan` AS `trang_thai_thanh_toan`,`dh`.`trang_thai_don_hang` AS `trang_thai_don_hang`,`dh`.`ngay_tao` AS `ngay_tao` from (`don_hang` `dh` join `nguoi_dung` `nd` on((`nd`.`ma_nguoi_dung` = `dh`.`ma_khach_hang`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_san_pham_ban_chay`
--

/*!50001 DROP VIEW IF EXISTS `v_san_pham_ban_chay`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_san_pham_ban_chay` AS select `sp`.`ma_san_pham` AS `ma_san_pham`,`sp`.`ten_san_pham` AS `ten_san_pham`,sum(`ct`.`so_luong`) AS `tong_so_luong_ban`,sum(`ct`.`thanh_tien`) AS `tong_doanh_thu` from ((`chi_tiet_don_hang` `ct` join `don_hang` `dh` on(((`dh`.`ma_don_hang` = `ct`.`ma_don_hang`) and (`dh`.`trang_thai_don_hang` <> 'da_huy')))) join `san_pham` `sp` on((`sp`.`ma_san_pham` = `ct`.`ma_san_pham`))) group by `sp`.`ma_san_pham`,`sp`.`ten_san_pham` order by `tong_so_luong_ban` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_san_pham_hien_thi`
--

/*!50001 DROP VIEW IF EXISTS `v_san_pham_hien_thi`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_san_pham_hien_thi` AS select `sp`.`ma_san_pham` AS `ma_san_pham`,`sp`.`ten_san_pham` AS `ten_san_pham`,`l`.`ten_loai_san_pham` AS `ten_loai_san_pham`,`sp`.`don_vi_tinh` AS `don_vi_tinh`,`sp`.`gia_ban` AS `gia_ban`,`sp`.`so_luong_ton` AS `so_luong_ton`,`sp`.`trang_thai` AS `trang_thai`,round(avg(`dg`.`so_sao`),1) AS `diem_trung_binh`,count(`dg`.`ma_danh_gia`) AS `so_danh_gia` from ((`san_pham` `sp` join `loai_san_pham` `l` on((`l`.`ma_loai_san_pham` = `sp`.`ma_loai_san_pham`))) left join `danh_gia_san_pham` `dg` on((`dg`.`ma_san_pham` = `sp`.`ma_san_pham`))) group by `sp`.`ma_san_pham`,`sp`.`ten_san_pham`,`l`.`ten_loai_san_pham`,`sp`.`don_vi_tinh`,`sp`.`gia_ban`,`sp`.`so_luong_ton`,`sp`.`trang_thai` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_san_pham_sap_het_hang`
--

/*!50001 DROP VIEW IF EXISTS `v_san_pham_sap_het_hang`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_san_pham_sap_het_hang` AS select `san_pham`.`ma_san_pham` AS `ma_san_pham`,`san_pham`.`ten_san_pham` AS `ten_san_pham`,`san_pham`.`don_vi_tinh` AS `don_vi_tinh`,`san_pham`.`so_luong_ton` AS `so_luong_ton` from `san_pham` where ((`san_pham`.`so_luong_ton` <= 20) and (`san_pham`.`trang_thai` = 'dang_ban')) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22 15:23:45
