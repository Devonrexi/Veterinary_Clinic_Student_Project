CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `second_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 2. Tabela zwierząt
CREATE TABLE `Animal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `species` varchar(50) NOT NULL,
  `breed` varchar(50) NOT NULL,
  `birth_date` date NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 3. Tabela usług (Cennik)
CREATE TABLE `Service` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 4. Tabela wizyt
CREATE TABLE `Appointment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_date` datetime NOT NULL,
  `status` varchar(20) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `vet_id` int NOT NULL,
  `animal_id` int NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`animal_id`) REFERENCES `Animal` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`vet_id`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 5. Tabela łącząca Wizytę z Usługami
CREATE TABLE `Appointment_Service` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `details` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `Appointment` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `Service` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- 6. Przykładowe dane 
INSERT INTO `Service` (`name`, `description`, `price`) VALUES
('Konsultacja weterynaryjna', 'Podstawowe badanie kliniczne i wywiad', 100.00),
('Szczepienie przeciw wściekliźnie', 'Obowiązkowe szczepienie (wymagane prawem)', 50.00),
('Szczepienie pakiet', 'Choroby zakaźne + wścieklizna', 90.00),
('Obcinanie pazurów', 'Zabieg pielęgnacyjny', 30.00),
('USG jamy brzusznej', 'Diagnostyka obrazowa', 150.00),
('Badanie krwi (Morfologia)', 'Podstawowa diagnostyka laboratoryjna', 80.00),
('Kastracja psa (mały)', 'Zabieg chirurgiczny w pełnej narkozie', 300.00),
('Sterylizacja kotki', 'Zabieg chirurgiczny w pełnej narkozie', 250.00),
('Sanacja jamy ustnej', 'Usuwanie kamienia nazębnego ultradźwiękami', 200.00),
('Kroplówka nawadniająca', 'Podanie płynów dożylnie', 60.00),
('Zastrzyk przeciwbólowy', 'Podanie leku (zastrzyk)', 40.00),
('Czipowanie', 'Wszczepienie mikroczipa identyfikacyjnego', 90.00),
('Paszport dla zwierzęcia', 'Wystawienie dokumentu podróży', 100.00);

