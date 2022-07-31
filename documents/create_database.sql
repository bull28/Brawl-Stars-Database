#-----------------------------------------------------------------------------------------------------
# Note: This is subject to change
#-----------------------------------------------------------------------------------------------------
# First time? environment variables setup (backend/.env)

# Set the following environment variables
# DATABASE_USER (username of the account created in the configuration)
# DATABASE_PASSWORD (password of the account)
# DATABASE_NAME (name of the database this table will be in)
#-----------------------------------------------------------------------------------------------------
# Not first time? Run the entire script to reset the table to its default state
#-----------------------------------------------------------------------------------------------------
# Update the table

# Note: Do not run this line if the table does not already exist
DROP TABLE `brawl_stars_database`;

CREATE TABLE `brawl_stars_database` (
  `username` VARCHAR(30) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `tokens` INT DEFAULT 0,
  `token_doubler` INT DEFAULT 0,
  `brawlers` JSON NOT NULL,
  PRIMARY KEY (`username`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;
#-----------------------------------------------------------------------------------------------------

# Insert a test value into the table
DELETE FROM `brawl_stars_database`;
INSERT INTO `brawl_stars_database` (`username`,`password`,`brawlers`) VALUES ("test", "x", '[]');
#-----------------------------------------------------------------------------------------------------

# Show contents of the table
SELECT * FROM `brawl_stars_database`;
#-----------------------------------------------------------------------------------------------------
