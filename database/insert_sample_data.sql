-- ============================================
-- Insertion de données de test pour le menu
-- À exécuter après avoir créé les tables
-- ============================================

-- Vérifier que les catégories existent déjà (insérées par le script principal)
-- Si elles n'existent pas, les créer
INSERT IGNORE INTO `cat` (`nom`, `description`, `ordre`, `actif`) VALUES
('Pizzas', 'Nos pizzas artisanales', 1, 1),
('Pâtes', 'Pâtes fraîches', 2, 1),
('Enfants', 'Menu enfants', 3, 1),
('Salade', 'Salades fraîches', 4, 1),
('Dessert', 'Desserts maison', 5, 1),
('Boisson', 'Boissons', 6, 1),
('Options', 'Options supplémentaires', 7, 1);

-- Récupérer les IDs des catégories
SET @cat_pizzas = (SELECT id FROM cat WHERE nom = 'Pizzas');
SET @cat_pates = (SELECT id FROM cat WHERE nom = 'Pâtes');
SET @cat_enfants = (SELECT id FROM cat WHERE nom = 'Enfants');
SET @cat_salade = (SELECT id FROM cat WHERE nom = 'Salade');
SET @cat_dessert = (SELECT id FROM cat WHERE nom = 'Dessert');
SET @cat_boisson = (SELECT id FROM cat WHERE nom = 'Boisson');
SET @cat_options = (SELECT id FROM cat WHERE nom = 'Options');

-- Insérer quelques pizzas de test
INSERT INTO `carte` (`cat_id`, `nom`, `description`, `prix`, `actif`, `ordre`) VALUES
(@cat_pizzas, 'Margherita', 'Tomate, mozzarella, basilic', 12.00, 1, 1),
(@cat_pizzas, '4 Fromages', 'Tomate, mozzarella, gorgonzola, chèvre, emmental', 14.00, 1, 2),
(@cat_pizzas, 'Reine', 'Tomate, mozzarella, jambon, champignons', 13.50, 1, 3),
(@cat_pizzas, 'Pepperoni', 'Tomate, mozzarella, pepperoni', 13.00, 1, 4),
(@cat_pizzas, 'Hawaïenne', 'Tomate, mozzarella, jambon, ananas', 13.50, 1, 5),
(@cat_pizzas, 'Calzone', 'Tomate, mozzarella, jambon, champignons (fermée)', 14.00, 1, 6);

-- Insérer quelques pâtes de test
INSERT INTO `carte` (`cat_id`, `nom`, `description`, `prix`, `actif`, `ordre`) VALUES
(@cat_pates, 'Spaghetti Carbonara', 'Spaghetti, lardons, crème, parmesan', 12.00, 1, 1),
(@cat_pates, 'Penne Arrabbiata', 'Penne, tomates, ail, piment', 11.00, 1, 2),
(@cat_pates, 'Lasagnes', 'Lasagnes, bolognaise, béchamel', 13.50, 1, 3);

-- Insérer quelques pizzas enfants
INSERT INTO `carte` (`cat_id`, `nom`, `description`, `prix`, `actif`, `ordre`) VALUES
(@cat_enfants, 'Pizza Enfant Margherita', 'Tomate, fromage', 7.50, 1, 1),
(@cat_enfants, 'Pizza Enfant Jambon', 'Tomate, fromage, jambon', 7.50, 1, 2),
(@cat_enfants, 'Pizza Enfant Chorizo', 'Tomate, fromage, chorizo', 7.50, 1, 3);

-- Insérer quelques salades
INSERT INTO `carte` (`cat_id`, `nom`, `description`, `prix`, `actif`, `ordre`) VALUES
(@cat_salade, 'Salade César', 'Salade, poulet, croûtons, parmesan', 10.00, 1, 1),
(@cat_salade, 'Salade Grecque', 'Salade, feta, olives, tomates', 9.50, 1, 2);

-- Insérer quelques desserts
INSERT INTO `carte` (`cat_id`, `nom`, `description`, `prix`, `actif`, `ordre`) VALUES
(@cat_dessert, 'Tiramisu', 'Tiramisu maison', 6.00, 1, 1),
(@cat_dessert, 'Panna Cotta', 'Panna cotta aux fruits rouges', 5.50, 1, 2),
(@cat_dessert, 'Glace', 'Boule de glace (vanille, chocolat, fraise)', 4.00, 1, 3);

-- Insérer quelques boissons
INSERT INTO `carte` (`cat_id`, `nom`, `description`, `prix`, `actif`, `ordre`) VALUES
(@cat_boisson, 'Coca-Cola', 'Coca-Cola 33cl', 2.50, 1, 1),
(@cat_boisson, 'Eau', 'Eau minérale 50cl', 2.00, 1, 2),
(@cat_boisson, 'Jus d\'orange', 'Jus d\'orange frais', 3.00, 1, 3),
(@cat_boisson, 'Bière', 'Bière pression 25cl', 3.50, 1, 4);

-- Insérer quelques options
INSERT INTO `carte` (`cat_id`, `nom`, `description`, `prix`, `actif`, `ordre`) VALUES
(@cat_options, 'Suppl. Brocoli', 'Supplément brocoli', 2.00, 1, 1),
(@cat_options, 'Suppl. Bolo', 'Supplément bolognaise', 2.00, 1, 2),
(@cat_options, 'Pâte Fine', 'Pâte fine', 0.00, 1, 3),
(@cat_options, 'Ail / Piment', 'Ail ou piment', 0.00, 1, 4);
