--DATABASE FOR TESTING

CREATE DATABASE  IF NOT EXISTS `task_api` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `task_api`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: task_api
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `body` text NOT NULL,
  `userId` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'Ažurirao sam moj prvi zadatak.',1,'2025-11-22 17:40:01','2025-11-22 18:21:35'),(2,'Admin je promenio Markov zadatak',1,'2025-11-22 17:41:10','2025-11-22 18:24:22'),(3,'Ovo je treći zadatak koji moram da uradim.',1,'2025-11-22 17:41:20','2025-11-22 17:41:20'),(4,'Ovo je četvrti zadatak koji moram da uradim.',1,'2025-11-22 17:41:31','2025-11-22 17:41:31'),(5,'Ovo je peti zadatak koji moram da uradim.',1,'2025-11-22 17:41:37','2025-11-22 17:41:37'),(6,'Admin promenio petrov prvi zadatak',2,'2025-11-22 18:11:44','2025-11-22 18:25:14'),(7,'Petrov drugi zadatak - napravi drugi zadatak',2,'2025-11-22 18:12:04','2025-11-22 18:12:04');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(40) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `username` varchar(35) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('basic','admin') DEFAULT 'basic',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Marko novo ime PARCIJALNO','Markovic UPDATED','marko123_new','marko_new@example.com','$2b$10$UKK6ROyyBEBZg/4788Lnweq8MZIq/adL2ujZpOVwVKaENok4uAPTm','basic','2025-11-22 17:25:26','2025-11-22 18:31:59'),(2,'Petar','Admin promenio prezime','petar_admin_changed','petar_admin@example.com','$2b$10$mPNnclGeaFmQduQuOBj9UuJwu7/K.3Q69E3HgmtHf6O4eHpb0Qa6C','basic','2025-11-22 17:27:03','2025-11-22 18:42:21'),(3,'Ana','Anic - bila adminovic (udala se) ','ana_super_admin','ana_super@example.com','$2b$10$c2FB6mgp9XEOWOKLy/K6T..IJEMdiiIQvXkTyX1NPrp08u63LMwx.','admin','2025-11-22 17:27:44','2025-11-22 18:45:06'),(4,'Test','User','test_unique','marko@example.com','$2b$10$4YZLxxV2MLqHKaKav1YTJuVj3cot0pam/M8cCuiEOur0ooXPUamOq','basic','2025-11-22 19:17:55','2025-11-22 19:17:55');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-23  0:09:38
