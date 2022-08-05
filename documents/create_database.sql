-- Run the entire script to reset the table to its default state
-- -----------------------------------------------------------------------------------------------------
-- Update or create the table

-- Note: Do not run this line if the table does not already exist
DROP TABLE `brawl_stars_database`;

-- Create the table
CREATE TABLE `brawl_stars_database` (
  `username` VARCHAR(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `tokens` INT DEFAULT 0,
  `token_doubler` INT DEFAULT 0,
  `coins` INT DEFAULT 0,
  `trade_credits` INT DEFAULT 0,
  `active_avatar` VARCHAR(200) NOT NULL,
  `brawlers` JSON NOT NULL,
  `avatars` JSON NOT NULL,
  `backgrounds` JSON NOT NULL,
  `trade_requests` JSON NOT NULL,
  PRIMARY KEY (`username`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4 COLLATE utf8mb4_bin;
-- -----------------------------------------------------------------------------------------------------

-- Insert a test value into the table
DELETE FROM `brawl_stars_database`;
INSERT INTO `brawl_stars_database` (`username`, `password`, `active_avatar`, `brawlers`, `avatars`, `backgrounds`, `trade_requests`) VALUES ("test", "x", "avatars/free/default.webp", '{}', '[]', '[]', '[]');
-- -----------------------------------------------------------------------------------------------------

-- Show contents of the table
SELECT * FROM `brawl_stars_database`;
-- -----------------------------------------------------------------------------------------------------

-- Test cases


-- All pins unlocked
INSERT INTO `brawl_stars_database` (`username`, `password`, `active_avatar`, `brawlers`, `avatars`, `backgrounds`, `trade_requests`) VALUES ("p2w", "x1", "avatars/free/default.webp", 
'{"shelly":["shelly_default","shelly_happy","shelly_sad","shelly_angry","shelly_gg","shelly_clap","shelly_thanks","shelly_sweat","shelly_special","shelly_brawloween"],"nita":["nita_default","nita_happy","nita_sad","nita_angry","nita_gg","nita_clap","nita_thanks","nita_sweat","nita_brawlidays_2018","nita_ranked","nita_goldenweek"],"colt":["colt_default","colt_happy","colt_sad","colt_angry","colt_gg","colt_clap","colt_thanks","colt_sweat","colt_special","colt_deepsea"],"bull":["bull_default","bull_happy","bull_sad","bull_angry","bull_gg","bull_clap","bull_thanks","bull_sweat","bull_bt21"],"jessie":["jessie_default","jessie_happy","jessie_sad","jessie_angry","jessie_gg","jessie_clap","jessie_thanks","jessie_sweat","jessie_goldenweek"],"brock":["brock_default","brock_happy","brock_sad","brock_angry","brock_gg","brock_clap","brock_thanks","brock_sweat","brock_retropolis","brock_ranked"],"dynamike":["dynamike_default","dynamike_happy","dynamike_sad","dynamike_angry","dynamike_gg","dynamike_clap","dynamike_thanks","dynamike_sweat","dynamike_special","dynamike_brawlidays_2018"],"bo":["bo_default","bo_happy","bo_sad","bo_angry","bo_gg","bo_clap","bo_thanks","bo_sweat","bo_special","bo_brawlidays","bo_biodome"],"tick":["tick_default","tick_happy","tick_sad","tick_angry","tick_gg","tick_clap","tick_thanks","tick_sweat","tick_brawlidays","tick_bt21"],"8bit":["8bit_default","8bit_happy","8bit_sad","8bit_angry","8bit_gg","8bit_clap","8bit_thanks","8bit_sweat","8bit_retropolis"],"emz":["emz_default","emz_happy","emz_sad","emz_angry","emz_gg","emz_clap","emz_thanks","emz_sweat","emz_special"],"stu":["stu_default","stu_happy","stu_sad","stu_angry","stu_gg","stu_clap","stu_thanks","stu_sweat","stu_special","stu_brawloween"],"elprimo":["elprimo_default","elprimo_happy","elprimo_sad","elprimo_angry","elprimo_gg","elprimo_clap","elprimo_thanks","elprimo_sweat","elprimo_special","elprimo_dragon","elprimo_dragonchroma","elprimo_lny22","elprimo_brawlentines"],"barley":["barley_default","barley_happy","barley_sad","barley_angry","barley_gg","barley_clap","barley_thanks","barley_sweat","barley_special","barley_retropolis","barley_lny22"],"poco":["poco_default","poco_happy","poco_sad","poco_angry","poco_gg","poco_clap","poco_thanks","poco_sweat","poco_special","poco_brawlentines"],"rosa":["rosa_default","rosa_happy","rosa_sad","rosa_angry","rosa_gg","rosa_clap","rosa_thanks","rosa_sweat","rosa_special","rosa_rosabrawloween_default","rosa_rosabrawloween_happy","rosa_rosabrawloween_sad","rosa_rosabrawloween_angry","rosa_rosabrawloween_gg","rosa_rosabrawloween_clap","rosa_rosabrawloween_thanks","rosa_rosabrawloween_sweat","rosa_rosabrawloween_special","rosa_lny22","rosa_biodome"],"rico":["rico_default","rico_happy","rico_sad","rico_angry","rico_gg","rico_clap","rico_thanks","rico_sweat","rico_biodome"],"darryl":["darryl_default","darryl_happy","darryl_sad","darryl_angry","darryl_gg","darryl_clap","darryl_thanks","darryl_sweat","darryl_megabox","darryl_megabox_02","darryl_ranked"],"penny":["penny_default","penny_happy","penny_sad","penny_angry","penny_gg","penny_clap","penny_thanks","penny_sweat","penny_special","penny_brawlidays_2018"],"carl":["carl_default","carl_happy","carl_sad","carl_angry","carl_gg","carl_clap","carl_thanks","carl_sweat","carl_special","carl_retropolis","carl_stuntshow"],"jacky":["jacky_default","jacky_happy","jacky_sad","jacky_angry","jacky_gg","jacky_clap","jacky_thanks","jacky_sweat","jacky_brawlidays","jacky_bt21"],"piper":["piper_default","piper_happy","piper_sad","piper_angry","piper_gg","piper_clap","piper_thanks","piper_sweat","piper_special","piper_brawloween","piper_brawlentines"],"pam":["pam_default","pam_happy","pam_sad","pam_angry","pam_gg","pam_clap","pam_thanks","pam_sweat"],"frank":["frank_default","frank_happy","frank_sad","frank_angry","frank_gg","frank_clap","frank_thanks","frank_sweat","frank_brawlidays"],"bibi":["bibi_default","bibi_happy","bibi_sad","bibi_angry","bibi_gg","bibi_clap","bibi_thanks","bibi_sweat","bibi_bt21"],"bea":["bea_default","bea_happy","bea_sad","bea_angry","bea_gg","bea_clap","bea_thanks","bea_sweat","bea_special","bea_goldenweek","bea_goldenweek_02"],"nani":["nani_default","nani_happy","nani_sad","nani_angry","nani_gg","nani_clap","nani_thanks","nani_sweat","nani_special"],"edgar":["edgar_default","edgar_happy","edgar_sad","edgar_angry","edgar_gg","edgar_clap","edgar_thanks","edgar_sweat","edgar_special","edgar_lny22","edgar_biodome","edgar_bt21"],"griff":["griff_default","griff_happy","griff_sad","griff_angry","griff_gg","griff_clap","griff_thanks","griff_sweat","griff_special","griff_brawlidays"],"grom":["grom_default","grom_happy","grom_sad","grom_angry","grom_gg","grom_clap","grom_thanks","grom_sweat","grom_special"],"bonnie":["bonnie_default","bonnie_happy","bonnie_sad","bonnie_angry","bonnie_gg","bonnie_clap","bonnie_thanks","bonnie_sweat","bonnie_special","bonnie_villains"],"mortis":["mortis_default","mortis_happy","mortis_sad","mortis_angry","mortis_gg","mortis_clap","mortis_thanks","mortis_sweat","mortis_retropolis"],"tara":["tara_default","tara_happy","tara_sad","tara_angry","tara_gg","tara_clap","tara_thanks","tara_sweat","tara_special","tara_lantern"],"gene":["gene_default","gene_happy","gene_sad","gene_angry","gene_gg","gene_clap","gene_thanks","gene_sweat","gene_special","gene_brawloween"],"max":["max_default","max_happy","max_sad","max_angry","max_gg","max_clap","max_thanks","max_sweat"],"mrp":["mrp_default","mrp_happy","mrp_sad","mrp_angry","mrp_gg","mrp_clap","mrp_thanks","mrp_sweat","mrp_brawloween","mrp_biodome","mrp_goldenweek","mrp_goldenweek_02"],"sprout":["sprout_default","sprout_happy","sprout_sad","sprout_angry","sprout_gg","sprout_clap","sprout_thanks","sprout_sweat","sprout_prince","sprout_princechroma","sprout_biodome"],"byron":["byron_default","byron_happy","byron_sad","byron_angry","byron_gg","byron_clap","byron_thanks","byron_sweat","byron_special","byron_villains"],"squeak":["squeak_default","squeak_happy","squeak_sad","squeak_angry","squeak_gg","squeak_clap","squeak_thanks","squeak_sweat","squeak_special","squeak_brawloween"],"spike":["spike_default","spike_happy","spike_sad","spike_angry","spike_gg","spike_clap","spike_thanks","spike_sweat","spike_pink","spike_lord","spike_brawlidays","spike_stuntshow"],"crow":["crow_default","crow_happy","crow_sad","crow_angry","crow_gg","crow_clap","crow_thanks","crow_sweat"],"leon":["leon_default","leon_happy","leon_sad","leon_angry","leon_gg","leon_clap","leon_thanks","leon_sweat","leon_brawloween"],"sandy":["sandy_default","sandy_happy","sandy_sad","sandy_angry","sandy_gg","sandy_clap","sandy_thanks","sandy_sweat","sandy_special","sandy_bt21"],"amber":["amber_default","amber_happy","amber_sad","amber_angry","amber_gg","amber_clap","amber_thanks","amber_sweat","amber_special"],"meg":["meg_default","meg_happy","meg_sad","meg_angry","meg_gg","meg_clap","meg_thanks","meg_sweat","meg_special","meg_biodome","meg_stuntshow"],"gale":["gale_default","gale_happy","gale_sad","gale_angry","gale_gg","gale_clap","gale_thanks","gale_sweat","gale_trader_default","gale_trader_happy","gale_trader_sad","gale_trader_angry","gale_trader_gg","gale_trader_clap","gale_trader_thanks","gale_trader_sweat"],"surge":["surge_default","surge_happy","surge_sad","surge_angry","surge_gg","surge_clap","surge_thanks","surge_sweat","surge_special","surge_knight_default","surge_knight_happy","surge_knight_sad","surge_knight_angry","surge_knight_gg","surge_knight_clap","surge_knight_thanks","surge_knight_sweat","surge_knight_special"],"colette":["colette_default","colette_happy","colette_sad","colette_angry","colette_gg","colette_clap","colette_thanks","colette_sweat","colette_trixie_default","colette_trixie_happy","colette_trixie_sad","colette_trixie_angry","colette_trixie_gg","colette_trixie_clap","colette_trixie_thanks","colette_trixie_sweat","colette_trixie_special"],"lou":["lou_default","lou_happy","lou_sad","lou_angry","lou_gg","lou_clap","lou_thanks","lou_sweat","lou_special","lou_king_default","lou_king_happy","lou_king_sad","lou_king_angry","lou_king_gg","lou_king_clap","lou_king_thanks","lou_king_sweat","lou_king_special","lou_brawlentines"],"ruffs":["ruffs_default","ruffs_happy","ruffs_sad","ruffs_angry","ruffs_gg","ruffs_clap","ruffs_thanks","ruffs_sweat","ruffs_special","ruffs_ronin_default","ruffs_ronin_happy","ruffs_ronin_sad","ruffs_ronin_angry","ruffs_ronin_gg","ruffs_ronin_clap","ruffs_ronin_thanks","ruffs_ronin_sweat","ruffs_ronin_special","ruffs_bt21"],"belle":["belle_default","belle_happy","belle_sad","belle_angry","belle_gg","belle_clap","belle_thanks","belle_sweat","belle_special","belle_boss_default","belle_boss_happy","belle_boss_sad","belle_boss_angry","belle_boss_gg","belle_boss_clap","belle_boss_thanks","belle_boss_sweat","belle_boss_special","belle_biodome","belle_deepsea"],"buzz":["buzz_default","buzz_happy","buzz_sad","buzz_angry","buzz_gg","buzz_clap","buzz_thanks","buzz_sweat","buzz_special","buzz_punk_default","buzz_punk_happy","buzz_punk_sad","buzz_punk_angry","buzz_punk_gg","buzz_punk_clap","buzz_punk_thanks","buzz_punk_sweat","buzz_punk_special"],"ash":["ash_default","ash_happy","ash_sad","ash_angry","ash_gg","ash_clap","ash_thanks","ash_sweat","ash_special","ash_ninja_default","ash_ninja_happy","ash_ninja_sad","ash_ninja_angry","ash_ninja_gg","ash_ninja_clap","ash_ninja_thanks","ash_ninja_sweat","ash_ninja_special"],"lola":["lola_default","lola_happy","lola_sad","lola_angry","lola_gg","lola_clap","lola_thanks","lola_sweat","lola_special","lola_chola_default","lola_chola_happy","lola_chola_sad","lola_chola_angry","lola_chola_gg","lola_chola_clap","lola_chola_thanks","lola_chola_sweat","lola_chola_special","lola_villains"],"fang":["fang_default","fang_happy","fang_sad","fang_angry","fang_gg","fang_clap","fang_thanks","fang_sweat","fang_special","fang_furious_default","fang_furious_happy","fang_furious_sad","fang_furious_angry","fang_furious_gg","fang_furious_clap","fang_furious_thanks","fang_furious_sweat","fang_furious_special","fang_deepsea"],"eve":["eve_default","eve_happy","eve_sad","eve_angry","eve_gg","eve_clap","eve_thanks","eve_sweat","eve_special","eve_spacecactus_default","eve_spacecactus_happy","eve_spacecactus_sad","eve_spacecactus_angry","eve_spacecactus_gg","eve_spacecactus_clap","eve_spacecactus_thanks","eve_spacecactus_sweat","eve_spacecactus_special"],"janet":["janet_default","janet_happy","janet_sad","janet_angry","janet_gg","janet_clap","janet_thanks","janet_sweat","janet_special","janet_valkyrie_default","janet_valkyrie_happy","janet_valkyrie_sad","janet_valkyrie_angry","janet_valkyrie_gg","janet_valkyrie_clap","janet_valkyrie_thanks","janet_valkyrie_sweat","janet_valkyrie_special"],"otis":["otis_default","otis_happy","otis_sad","otis_angry","otis_gg","otis_clap","otis_thanks","otis_sweat","otis_special","otis_pharaoh_default","otis_pharaoh_happy","otis_pharaoh_sad","otis_pharaoh_angry","otis_pharaoh_gg","otis_pharaoh_clap","otis_pharaoh_thanks","otis_pharaoh_sweat","otis_pharaoh_special"]}',
'[]', '[]', '[]'
);
-- Almost all pins
INSERT INTO `brawl_stars_database` (`username`, `password`, `active_avatar`, `brawlers`, `avatars`, `backgrounds`, `trade_requests`) VALUES ("almostallpins", "x1", "avatars/free/default.webp", 
'{"shelly":["shelly_default","shelly_happy","shelly_sad","shelly_angry","shelly_gg","shelly_clap","shelly_thanks","shelly_sweat","shelly_special","shelly_brawloween"],"nita":["nita_default","nita_happy","nita_sad","nita_angry","nita_gg","nita_clap","nita_thanks","nita_sweat","nita_brawlidays_2018","nita_ranked","nita_goldenweek"],"colt":["colt_default","colt_happy","colt_sad","colt_angry","colt_gg","colt_clap","colt_thanks","colt_sweat","colt_special","colt_deepsea"],"bull":["bull_default","bull_happy","bull_sad","bull_angry","bull_gg","bull_clap","bull_thanks","bull_sweat","bull_bt21"],"jessie":["jessie_default","jessie_happy","jessie_sad","jessie_angry","jessie_gg","jessie_clap","jessie_thanks","jessie_sweat","jessie_goldenweek"],"brock":["brock_default","brock_happy","brock_sad","brock_angry","brock_gg","brock_clap","brock_thanks","brock_sweat","brock_retropolis","brock_ranked"],"dynamike":["dynamike_default","dynamike_happy","dynamike_sad","dynamike_angry","dynamike_gg","dynamike_thanks","dynamike_special","dynamike_brawlidays_2018"],"bo":["bo_default","bo_happy","bo_sad","bo_angry","bo_gg","bo_clap","bo_thanks","bo_sweat","bo_special","bo_brawlidays","bo_biodome"],"tick":["tick_default","tick_happy","tick_sad","tick_angry","tick_gg","tick_clap","tick_thanks","tick_sweat","tick_brawlidays","tick_bt21"],"8bit":["8bit_default","8bit_happy","8bit_sad","8bit_angry","8bit_gg","8bit_clap","8bit_thanks","8bit_sweat","8bit_retropolis"],"emz":["emz_default","emz_happy","emz_sad","emz_angry","emz_gg","emz_clap","emz_thanks","emz_sweat","emz_special"],"stu":["stu_default","stu_happy","stu_sad","stu_angry","stu_gg","stu_clap","stu_thanks","stu_sweat","stu_special","stu_brawloween"],"elprimo":["elprimo_default","elprimo_happy","elprimo_sad","elprimo_angry","elprimo_gg","elprimo_clap","elprimo_thanks","elprimo_sweat","elprimo_special","elprimo_dragon","elprimo_dragonchroma","elprimo_lny22","elprimo_brawlentines"],"barley":["barley_default","barley_happy","barley_sad","barley_angry","barley_gg","barley_clap","barley_thanks","barley_sweat","barley_special","barley_retropolis","barley_lny22"],"poco":["poco_default","poco_happy","poco_sad","poco_angry","poco_gg","poco_clap","poco_thanks","poco_sweat","poco_special","poco_brawlentines"],"rosa":["rosa_default","rosa_happy","rosa_sad","rosa_angry","rosa_gg","rosa_clap","rosa_thanks","rosa_sweat","rosa_special","rosa_rosabrawloween_default","rosa_rosabrawloween_happy","rosa_rosabrawloween_sad","rosa_rosabrawloween_angry","rosa_rosabrawloween_gg","rosa_rosabrawloween_clap","rosa_rosabrawloween_thanks","rosa_rosabrawloween_sweat","rosa_rosabrawloween_special","rosa_lny22","rosa_biodome"],"rico":["rico_default","rico_happy","rico_sad","rico_angry","rico_gg","rico_clap","rico_thanks","rico_sweat","rico_biodome"],"darryl":["darryl_default","darryl_happy","darryl_sad","darryl_angry","darryl_gg","darryl_clap","darryl_thanks","darryl_sweat","darryl_megabox","darryl_megabox_02","darryl_ranked"],"penny":["penny_default","penny_happy","penny_sad","penny_angry","penny_gg","penny_clap","penny_thanks","penny_sweat","penny_special","penny_brawlidays_2018"],"carl":["carl_default","carl_happy","carl_sad","carl_angry","carl_gg","carl_clap","carl_thanks","carl_sweat","carl_special","carl_retropolis","carl_stuntshow"],"jacky":["jacky_default","jacky_happy","jacky_sad","jacky_angry","jacky_gg","jacky_clap","jacky_thanks","jacky_sweat","jacky_brawlidays","jacky_bt21"],"piper":["piper_default","piper_happy","piper_sad","piper_angry","piper_gg","piper_clap","piper_thanks","piper_sweat","piper_special","piper_brawloween","piper_brawlentines"],"pam":["pam_default","pam_happy","pam_sad","pam_angry","pam_gg","pam_clap","pam_thanks","pam_sweat"],"frank":["frank_default","frank_happy","frank_sad","frank_angry","frank_gg","frank_clap","frank_thanks","frank_sweat","frank_brawlidays"],"bibi":["bibi_default","bibi_happy","bibi_sad","bibi_angry","bibi_gg","bibi_clap","bibi_thanks","bibi_sweat","bibi_bt21"],"bea":["bea_default","bea_happy","bea_sad","bea_angry","bea_gg","bea_clap","bea_thanks","bea_special","bea_goldenweek","bea_goldenweek_02"],"nani":["nani_default","nani_happy","nani_sad","nani_angry","nani_gg","nani_clap","nani_thanks","nani_sweat","nani_special"],"edgar":["edgar_default","edgar_happy","edgar_sad","edgar_angry","edgar_gg","edgar_clap","edgar_thanks","edgar_sweat","edgar_special","edgar_lny22","edgar_biodome","edgar_bt21"],"griff":["griff_default","griff_happy","griff_sad","griff_angry","griff_gg","griff_clap","griff_thanks","griff_sweat","griff_special","griff_brawlidays"],"grom":["grom_default","grom_happy","grom_sad","grom_angry","grom_gg","grom_clap","grom_thanks","grom_sweat","grom_special"],"bonnie":["bonnie_default","bonnie_happy","bonnie_sad","bonnie_angry","bonnie_gg","bonnie_clap","bonnie_thanks","bonnie_sweat","bonnie_special","bonnie_villains"],"mortis":["mortis_default","mortis_happy","mortis_sad","mortis_angry","mortis_gg","mortis_clap","mortis_thanks","mortis_sweat","mortis_retropolis"],"tara":["tara_default","tara_happy","tara_sad","tara_angry","tara_gg","tara_clap","tara_thanks","tara_sweat","tara_special","tara_lantern"],"gene":["gene_default","gene_happy","gene_sad","gene_angry","gene_gg","gene_clap","gene_thanks","gene_sweat","gene_special","gene_brawloween"],"max":["max_default","max_happy","max_sad","max_angry","max_gg","max_clap","max_thanks","max_sweat"],"mrp":["mrp_default","mrp_happy","mrp_sad","mrp_angry","mrp_gg","mrp_clap","mrp_thanks","mrp_sweat","mrp_brawloween","mrp_biodome","mrp_goldenweek","mrp_goldenweek_02"],"sprout":["sprout_default","sprout_happy","sprout_sad","sprout_angry","sprout_gg","sprout_clap","sprout_thanks","sprout_sweat","sprout_prince","sprout_princechroma","sprout_biodome"],"byron":["byron_default","byron_happy","byron_sad","byron_angry","byron_gg","byron_clap","byron_thanks","byron_sweat","byron_special","byron_villains"],"squeak":["squeak_default","squeak_happy","squeak_sad","squeak_angry","squeak_gg","squeak_clap","squeak_thanks","squeak_sweat","squeak_special","squeak_brawloween"],"spike":["spike_default","spike_happy","spike_sad","spike_angry","spike_gg","spike_clap","spike_thanks","spike_sweat","spike_pink","spike_lord","spike_brawlidays","spike_stuntshow"],"crow":["crow_default","crow_happy","crow_sad","crow_angry","crow_gg","crow_clap","crow_thanks","crow_sweat"],"leon":["leon_default","leon_happy","leon_sad","leon_angry","leon_gg","leon_clap","leon_thanks","leon_sweat","leon_brawloween"],"sandy":["sandy_default","sandy_happy","sandy_sad","sandy_angry","sandy_gg","sandy_clap","sandy_thanks","sandy_sweat","sandy_special","sandy_bt21"],"amber":["amber_default","amber_happy","amber_sad","amber_angry","amber_gg","amber_clap","amber_thanks","amber_sweat","amber_special"],"meg":["meg_default","meg_happy","meg_sad","meg_angry","meg_gg","meg_clap","meg_thanks","meg_sweat","meg_special","meg_biodome","meg_stuntshow"],"gale":["gale_default","gale_happy","gale_sad","gale_angry","gale_gg","gale_clap","gale_thanks","gale_sweat","gale_trader_default","gale_trader_happy","gale_trader_sad","gale_trader_angry","gale_trader_gg","gale_trader_clap","gale_trader_thanks","gale_trader_sweat"],"surge":["surge_default","surge_happy","surge_sad","surge_angry","surge_gg","surge_clap","surge_thanks","surge_sweat","surge_special","surge_knight_default","surge_knight_happy","surge_knight_sad","surge_knight_angry","surge_knight_gg","surge_knight_clap","surge_knight_thanks","surge_knight_sweat","surge_knight_special"],"colette":["colette_default","colette_happy","colette_sad","colette_angry","colette_gg","colette_clap","colette_thanks","colette_sweat","colette_trixie_default","colette_trixie_happy","colette_trixie_sad","colette_trixie_angry","colette_trixie_gg","colette_trixie_clap","colette_trixie_thanks","colette_trixie_sweat","colette_trixie_special"],"lou":["lou_default","lou_happy","lou_sad","lou_angry","lou_gg","lou_clap","lou_thanks","lou_sweat","lou_special","lou_king_default","lou_king_happy","lou_king_sad","lou_king_angry","lou_king_gg","lou_king_clap","lou_king_thanks","lou_king_sweat","lou_king_special","lou_brawlentines"],"ruffs":["ruffs_default","ruffs_happy","ruffs_sad","ruffs_angry","ruffs_gg","ruffs_clap","ruffs_thanks","ruffs_sweat","ruffs_special","ruffs_ronin_default","ruffs_ronin_happy","ruffs_ronin_sad","ruffs_ronin_angry","ruffs_ronin_gg","ruffs_ronin_clap","ruffs_ronin_thanks","ruffs_ronin_sweat","ruffs_ronin_special","ruffs_bt21"],"belle":["belle_default","belle_happy","belle_sad","belle_angry","belle_gg","belle_clap","belle_thanks","belle_sweat","belle_special","belle_boss_default","belle_boss_happy","belle_boss_sad","belle_boss_angry","belle_boss_gg","belle_boss_clap","belle_boss_thanks","belle_boss_sweat","belle_boss_special","belle_biodome","belle_deepsea"],"buzz":["buzz_default","buzz_happy","buzz_sad","buzz_angry","buzz_gg","buzz_clap","buzz_thanks","buzz_sweat","buzz_special","buzz_punk_default","buzz_punk_happy","buzz_punk_sad","buzz_punk_angry","buzz_punk_gg","buzz_punk_clap","buzz_punk_thanks","buzz_punk_sweat"],"ash":["ash_default","ash_happy","ash_sad","ash_angry","ash_gg","ash_clap","ash_thanks","ash_sweat","ash_special","ash_ninja_default","ash_ninja_happy","ash_ninja_sad","ash_ninja_angry","ash_ninja_gg","ash_ninja_clap","ash_ninja_thanks","ash_ninja_sweat","ash_ninja_special"],"lola":["lola_default","lola_happy","lola_sad","lola_angry","lola_gg","lola_clap","lola_thanks","lola_sweat","lola_special","lola_chola_default","lola_chola_happy","lola_chola_sad","lola_chola_angry","lola_chola_gg","lola_chola_clap","lola_chola_thanks","lola_chola_sweat","lola_chola_special","lola_villains"],"fang":["fang_default","fang_happy","fang_sad","fang_angry","fang_gg","fang_clap","fang_thanks","fang_sweat","fang_special","fang_furious_default","fang_furious_happy","fang_furious_sad","fang_furious_angry","fang_furious_gg","fang_furious_clap","fang_furious_thanks","fang_furious_sweat","fang_furious_special","fang_deepsea"],"eve":["eve_default","eve_happy","eve_sad","eve_angry","eve_gg","eve_clap","eve_thanks","eve_sweat","eve_special","eve_spacecactus_default","eve_spacecactus_happy","eve_spacecactus_sad","eve_spacecactus_angry","eve_spacecactus_gg","eve_spacecactus_clap","eve_spacecactus_thanks","eve_spacecactus_sweat","eve_spacecactus_special"],"janet":["janet_default","janet_happy","janet_sad","janet_angry","janet_gg","janet_clap","janet_thanks","janet_sweat","janet_special","janet_valkyrie_default","janet_valkyrie_happy","janet_valkyrie_sad","janet_valkyrie_angry","janet_valkyrie_gg","janet_valkyrie_clap","janet_valkyrie_thanks","janet_valkyrie_sweat","janet_valkyrie_special"],"otis":["otis_default","otis_happy","otis_sad","otis_angry","otis_gg","otis_clap","otis_thanks","otis_sweat","otis_special","otis_pharaoh_default","otis_pharaoh_happy","otis_pharaoh_sad","otis_pharaoh_angry","otis_pharaoh_gg","otis_pharaoh_clap","otis_pharaoh_sweat","otis_pharaoh_special"]}',
'[]', '[]', '[]'
);
-- Some pins
INSERT INTO `brawl_stars_database` (`username`, `password`, `active_avatar`, `brawlers`, `avatars`, `backgrounds`, `trade_requests`) VALUES ("somepins", "x1", "avatars/free/default.webp", 
'{"shelly": ["shelly_clap", "shelly_angry", "shelly_default", "shelly_happy", "shelly_sweat"], "nita": ["nita_happy", "nita_sweat", "nita_gg", "nita_sad", "nita_goldenweek"], "colt": ["colt_thanks", "colt_deepsea"], "bull": ["bull_default", "bull_sweat", "bull_thanks", "bull_clap", "bull_gg", "bull_angry", "bull_sad", "bull_bt21"], "jessie": ["jessie_clap", "jessie_sweat", "jessie_goldenweek", "jessie_gg"], "brock": ["brock_retropolis", "brock_gg", "brock_thanks", "brock_angry"], "dynamike": ["dynamike_sad"], "bo": ["bo_biodome", "bo_brawlidays"], "tick": ["tick_bt21", "tick_gg", "tick_happy", "tick_default", "tick_sweat"], "8bit": ["8bit_gg", "8bit_default", "8bit_thanks", "8bit_retropolis"], "emz": ["emz_sweat", "emz_happy", "emz_clap"], "stu": ["stu_special", "stu_clap", "stu_sweat", "stu_happy"], "elprimo": ["elprimo_lny22", "elprimo_default", "elprimo_gg", "elprimo_special", "elprimo_angry"], "barley": ["barley_retropolis", "barley_clap", "barley_sweat", "barley_sad", "barley_happy", "barley_angry", "barley_special", "barley_thanks"], "poco": ["poco_clap", "poco_happy", "poco_sweat", "poco_angry", "poco_default", "poco_sad"], "rosa": ["rosa_sweat", "rosa_rosabrawloween_special", "rosa_rosabrawloween_gg", "rosa_rosabrawloween_sad", "rosa_biodome", "rosa_rosabrawloween_default", "rosa_lny22", "rosa_clap", "rosa_thanks", "rosa_angry", "rosa_default"], "rico": ["rico_thanks", "rico_gg", "rico_angry", "rico_happy", "rico_biodome"], "darryl": ["darryl_happy", "darryl_gg", "darryl_default", "darryl_sweat"], "penny": ["penny_thanks", "penny_special", "penny_gg", "penny_sad", "penny_default"], "carl": ["carl_clap", "carl_gg", "carl_sad"], "jacky": ["jacky_sweat", "jacky_gg", "jacky_default", "jacky_brawlidays", "jacky_sad", "jacky_clap"], "piper": ["piper_clap", "piper_special", "piper_angry", "piper_default", "piper_sweat"], "pam": ["pam_gg", "pam_clap", "pam_thanks", "pam_happy", "pam_sweat"], "frank": ["frank_sweat", "frank_thanks", "frank_default", "frank_sad", "frank_clap"], "bibi": ["bibi_bt21", "bibi_sad", "bibi_happy", "bibi_thanks", "bibi_angry", "bibi_sweat", "bibi_gg"], "bea": ["bea_gg", "bea_default", "bea_happy", "bea_goldenweek", "bea_angry"], "nani": ["nani_sad", "nani_default", "nani_gg"], "edgar": ["edgar_bt21", "edgar_gg", "edgar_happy", "edgar_sad", "edgar_thanks"], "griff": ["griff_sweat", "griff_default", "griff_clap", "griff_thanks", "griff_happy", "griff_special"], "grom": ["grom_default", "grom_happy", "grom_thanks", "grom_angry"], "bonnie": ["bonnie_angry", "bonnie_happy", "bonnie_clap", "bonnie_sad", "bonnie_sweat"], "mortis": ["mortis_retropolis", "mortis_sad", "mortis_happy", "mortis_thanks", "mortis_sweat"], "tara": ["tara_happy", "tara_gg", "tara_thanks"], "gene": ["gene_gg", "gene_sad", "gene_clap", "gene_brawloween", "gene_special", "gene_sweat", "gene_happy"], "max": ["max_happy", "max_sweat", "max_angry", "max_default", "max_clap"], "mrp": ["mrp_sweat", "mrp_sad", "mrp_angry", "mrp_thanks", "mrp_goldenweek_02", "mrp_goldenweek", "mrp_gg"], "sprout": ["sprout_sweat", "sprout_biodome", "sprout_princechroma", "sprout_thanks", "sprout_angry", "sprout_clap", "sprout_prince", "sprout_sad"], "byron": ["byron_angry", "byron_villains", "byron_sweat", "byron_default"], "squeak": ["squeak_thanks", "squeak_sweat", "squeak_special", "squeak_angry", "squeak_happy", "squeak_clap"], "spike": ["spike_sweat", "spike_lord", "spike_sad", "spike_default", "spike_pink", "spike_clap", "spike_happy"], "crow": ["crow_clap", "crow_angry", "crow_default", "crow_happy", "crow_gg"], "leon": ["leon_sweat", "leon_sad", "leon_angry"], "sandy": ["sandy_bt21", "sandy_clap", "sandy_happy", "sandy_sweat", "sandy_sad"], "amber": ["amber_happy", "amber_special"], "meg": ["meg_angry", "meg_gg", "meg_clap", "meg_stuntshow", "meg_default", "meg_special", "meg_happy", "meg_sweat"], "gale": ["gale_clap", "gale_gg", "gale_trader_happy", "gale_trader_gg", "gale_trader_angry", "gale_angry", "gale_trader_default", "gale_default", "gale_trader_sad"], "surge": ["surge_knight_happy", "surge_thanks", "surge_knight_sweat", "surge_knight_angry", "surge_knight_special", "surge_knight_gg", "surge_knight_thanks", "surge_gg"], "colette": ["colette_trixie_sad", "colette_sad", "colette_sweat", "colette_happy", "colette_clap", "colette_trixie_special", "colette_trixie_angry", "colette_trixie_sweat", "colette_trixie_thanks", "colette_trixie_happy"], "lou": ["lou_sweat", "lou_sad", "lou_clap", "lou_king_angry", "lou_gg", "lou_king_default", "lou_king_sad", "lou_king_happy", "lou_angry", "lou_brawlentines", "lou_happy"], "ruffs": ["ruffs_clap", "ruffs_ronin_clap", "ruffs_gg", "ruffs_ronin_special", "ruffs_bt21", "ruffs_ronin_thanks", "ruffs_ronin_angry", "ruffs_happy", "ruffs_sweat", "ruffs_angry", "ruffs_ronin_gg", "ruffs_ronin_happy", "ruffs_default"], "belle": ["belle_clap", "belle_deepsea", "belle_sweat", "belle_happy", "belle_boss_angry", "belle_angry", "belle_boss_clap", "belle_special"], "buzz": ["buzz_punk_thanks", "buzz_punk_default", "buzz_gg", "buzz_punk_sweat", "buzz_punk_sad", "buzz_clap", "buzz_sweat", "buzz_punk_angry"], "ash": ["ash_ninja_clap", "ash_sweat", "ash_ninja_special", "ash_ninja_default", "ash_ninja_happy", "ash_ninja_angry"], "lola": ["lola_chola_angry", "lola_special", "lola_chola_sad", "lola_chola_clap", "lola_sweat", "lola_clap", "lola_chola_special", "lola_chola_happy", "lola_happy"], "fang": ["fang_deepsea", "fang_gg", "fang_clap", "fang_special", "fang_furious_special", "fang_furious_clap", "fang_default", "fang_furious_sad", "fang_furious_happy", "fang_thanks"], "eve": ["eve_thanks", "eve_angry", "eve_spacecactus_clap", "eve_happy", "eve_spacecactus_happy", "eve_clap", "eve_sad", "eve_spacecactus_default", "eve_spacecactus_sweat", "eve_sweat"], "janet": ["janet_angry", "janet_valkyrie_gg", "janet_valkyrie_clap", "janet_happy", "janet_valkyrie_happy", "janet_default", "janet_gg", "janet_valkyrie_special"], "otis": ["otis_gg", "otis_thanks", "otis_pharaoh_clap", "otis_happy", "otis_pharaoh_happy", "otis_sad", "otis_pharaoh_special", "otis_pharaoh_sad", "otis_clap", "otis_pharaoh_gg", "otis_pharaoh_angry", "otis_pharaoh_sweat", "otis_angry"]}',
'[]', '[]', '[]'
);
-- Some pins and missing brawlers
INSERT INTO `brawl_stars_database` (`username`, `password`, `active_avatar`, `brawlers`, `avatars`, `backgrounds`, `trade_requests`) VALUES ("f2p", "x1", "avatars/free/default.webp", 
'{"nita": ["nita_happy", "nita_sweat", "nita_gg", "nita_sad", "nita_goldenweek"], "colt": ["colt_thanks", "colt_deepsea"], "bull": ["bull_default", "bull_sweat", "bull_thanks", "bull_clap", "bull_gg", "bull_angry", "bull_sad", "bull_bt21"], "jessie": ["jessie_clap", "jessie_sweat", "jessie_goldenweek", "jessie_gg"], "brock": ["brock_retropolis", "brock_gg", "brock_thanks", "brock_angry"], "dynamike": ["dynamike_sad"], "bo": ["bo_biodome", "bo_brawlidays"], "tick": ["tick_bt21", "tick_gg", "tick_happy", "tick_default", "tick_sweat"], "8bit": ["8bit_gg", "8bit_default", "8bit_thanks", "8bit_retropolis"], "emz": ["emz_sweat", "emz_happy", "emz_clap"], "stu": ["stu_special", "stu_clap", "stu_sweat", "stu_happy"], "elprimo": ["elprimo_lny22", "elprimo_default", "elprimo_gg", "elprimo_special", "elprimo_angry"], "barley": ["barley_retropolis", "barley_clap", "barley_sweat", "barley_sad", "barley_happy", "barley_angry", "barley_special", "barley_thanks"], "poco": ["poco_clap", "poco_happy", "poco_sweat", "poco_angry", "poco_default", "poco_sad"], "rosa": ["rosa_sweat", "rosa_rosabrawloween_special", "rosa_rosabrawloween_gg", "rosa_rosabrawloween_sad", "rosa_biodome", "rosa_rosabrawloween_default", "rosa_lny22", "rosa_clap", "rosa_thanks", "rosa_angry", "rosa_default"], "rico": ["rico_thanks", "rico_gg", "rico_angry", "rico_happy", "rico_biodome"], "darryl": ["darryl_happy", "darryl_gg", "darryl_default", "darryl_sweat"], "penny": ["penny_thanks", "penny_special", "penny_gg", "penny_sad", "penny_default"], "carl": ["carl_clap", "carl_gg", "carl_sad"], "jacky": ["jacky_sweat", "jacky_gg", "jacky_default", "jacky_brawlidays", "jacky_sad", "jacky_clap"], "piper": ["piper_clap", "piper_special", "piper_angry", "piper_default", "piper_sweat"], "pam": ["pam_gg", "pam_clap", "pam_thanks", "pam_happy", "pam_sweat"], "frank": ["frank_sweat", "frank_thanks", "frank_default", "frank_sad", "frank_clap"], "bibi": ["bibi_bt21", "bibi_sad", "bibi_happy", "bibi_thanks", "bibi_angry", "bibi_sweat", "bibi_gg"], "bea": ["bea_gg", "bea_default", "bea_happy", "bea_goldenweek", "bea_angry"], "nani": ["nani_sad", "nani_default", "nani_gg"], "edgar": ["edgar_bt21", "edgar_gg", "edgar_happy", "edgar_sad", "edgar_thanks"], "griff": ["griff_sweat", "griff_default", "griff_clap", "griff_thanks", "griff_happy", "griff_special"], "grom": ["grom_default", "grom_happy", "grom_thanks", "grom_angry"], "bonnie": ["bonnie_angry", "bonnie_happy", "bonnie_clap", "bonnie_sad", "bonnie_sweat"], "mortis": ["mortis_retropolis", "mortis_sad", "mortis_happy", "mortis_thanks", "mortis_sweat"], "gene": ["gene_gg", "gene_sad", "gene_clap", "gene_brawloween", "gene_special", "gene_sweat", "gene_happy"], "max": ["max_happy", "max_sweat", "max_angry", "max_default", "max_clap"], "mrp": ["mrp_sweat", "mrp_sad", "mrp_angry", "mrp_thanks", "mrp_goldenweek_02", "mrp_goldenweek", "mrp_gg"], "sprout": ["sprout_sweat", "sprout_biodome", "sprout_princechroma", "sprout_thanks", "sprout_angry", "sprout_clap", "sprout_prince", "sprout_sad"], "byron": ["byron_angry", "byron_villains", "byron_sweat", "byron_default"], "squeak": ["squeak_thanks", "squeak_sweat", "squeak_special", "squeak_angry", "squeak_happy", "squeak_clap"], "spike": ["spike_sweat", "spike_lord", "spike_sad", "spike_default", "spike_pink", "spike_clap", "spike_happy"], "crow": ["crow_clap", "crow_angry", "crow_default", "crow_happy", "crow_gg"], "leon": ["leon_sweat", "leon_sad", "leon_angry"], "sandy": ["sandy_bt21", "sandy_clap", "sandy_happy", "sandy_sweat", "sandy_sad"], "amber": ["amber_happy", "amber_special"], "meg": ["meg_angry", "meg_gg", "meg_clap", "meg_stuntshow", "meg_default", "meg_special", "meg_happy", "meg_sweat"], "gale": ["gale_clap", "gale_gg", "gale_trader_happy", "gale_trader_gg", "gale_trader_angry", "gale_angry", "gale_trader_default", "gale_default", "gale_trader_sad"], "surge": ["surge_knight_happy", "surge_thanks", "surge_knight_sweat", "surge_knight_angry", "surge_knight_special", "surge_knight_gg", "surge_knight_thanks", "surge_gg"], "colette": ["colette_trixie_sad", "colette_sad", "colette_sweat", "colette_happy", "colette_clap", "colette_trixie_special", "colette_trixie_angry", "colette_trixie_sweat", "colette_trixie_thanks", "colette_trixie_happy"], "lou": ["lou_sweat", "lou_sad", "lou_clap", "lou_king_angry", "lou_gg", "lou_king_default", "lou_king_sad", "lou_king_happy", "lou_angry", "lou_brawlentines", "lou_happy"], "ruffs": ["ruffs_clap", "ruffs_ronin_clap", "ruffs_gg", "ruffs_ronin_special", "ruffs_bt21", "ruffs_ronin_thanks", "ruffs_ronin_angry", "ruffs_happy", "ruffs_sweat", "ruffs_angry", "ruffs_ronin_gg", "ruffs_ronin_happy", "ruffs_default"], "belle": ["belle_clap", "belle_deepsea", "belle_sweat", "belle_happy", "belle_boss_angry", "belle_angry", "belle_boss_clap", "belle_special"], "buzz": ["buzz_punk_thanks", "buzz_punk_default", "buzz_gg", "buzz_punk_sweat", "buzz_punk_sad", "buzz_clap", "buzz_sweat", "buzz_punk_angry"], "ash": ["ash_ninja_clap", "ash_sweat", "ash_ninja_special", "ash_ninja_default", "ash_ninja_happy", "ash_ninja_angry"], "lola": ["lola_chola_angry", "lola_special", "lola_chola_sad", "lola_chola_clap", "lola_sweat", "lola_clap", "lola_chola_special", "lola_chola_happy", "lola_happy"], "fang": ["fang_deepsea", "fang_gg", "fang_clap", "fang_special", "fang_furious_special", "fang_furious_clap", "fang_default", "fang_furious_sad", "fang_furious_happy", "fang_thanks"], "eve": ["eve_thanks", "eve_angry", "eve_spacecactus_clap", "eve_happy", "eve_spacecactus_happy", "eve_clap", "eve_sad", "eve_spacecactus_default", "eve_spacecactus_sweat", "eve_sweat"], "janet": ["janet_angry", "janet_valkyrie_gg", "janet_valkyrie_clap", "janet_happy", "janet_valkyrie_happy", "janet_default", "janet_gg", "janet_valkyrie_special"], "otis": ["otis_gg", "otis_thanks", "otis_pharaoh_clap", "otis_happy", "otis_pharaoh_happy", "otis_sad", "otis_pharaoh_special", "otis_pharaoh_sad", "otis_clap", "otis_pharaoh_gg", "otis_pharaoh_angry", "otis_pharaoh_sweat", "otis_angry"]}',
'[]', '[]', '[]'
);
