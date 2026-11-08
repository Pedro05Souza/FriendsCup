-- Ratings after Copa Nabor (21 Mar 2026), the latest cup, as updated after it.
--
-- 1. Sets each player's current ratings to these values.
-- 2. Saves them as the players' ratings after that cup (replacing any saved
--    from the app for that cup).
--
-- Overall is the rounded average of the four attributes, as in the app.

UPDATE "player" p
SET "attack" = v.attack, "defense" = v.defense, "intelligence" = v.intelligence, "mentality" = v.mentality
FROM (VALUES
    ('Lucas Bauer', 94, 95, 90, 95, 94),
    ('Ferreira', 91, 97, 90, 88, 89),
    ('Leo', 90, 99, 89, 98, 74),
    ('Thiago', 88, 93, 83, 88, 88),
    ('Stertz', 87, 84, 84, 88, 91),
    ('Pedro', 83, 85, 82, 80, 84),
    ('Bauer', 80, 78, 80, 82, 81),
    ('Lucas Daudt', 78, 78, 80, 77, 77),
    ('Cansan', 71, 71, 65, 74, 75),
    ('Cruz', 68, 65, 62, 60, 84)
) AS v(player_name, overall, attack, defense, intelligence, mentality)
WHERE p."name" = v.player_name;

INSERT INTO "player_rating_snapshot"
    ("id", "player_id", "championship_id", "taken_at", "scale", "raw_overall", "overall", "attack", "defense", "intelligence", "mentality")
SELECT
    gen_random_uuid()::text, p."id", c."id", c."created_at", 'POINTS_100', v.overall, v.overall,
    v.attack, v.defense, v.intelligence, v.mentality
FROM (VALUES
    ('Lucas Bauer', 94, 95, 90, 95, 94),
    ('Ferreira', 91, 97, 90, 88, 89),
    ('Leo', 90, 99, 89, 98, 74),
    ('Thiago', 88, 93, 83, 88, 88),
    ('Stertz', 87, 84, 84, 88, 91),
    ('Pedro', 83, 85, 82, 80, 84),
    ('Bauer', 80, 78, 80, 82, 81),
    ('Lucas Daudt', 78, 78, 80, 77, 77),
    ('Cansan', 71, 71, 65, 74, 75),
    ('Cruz', 68, 65, 62, 60, 84)
) AS v(player_name, overall, attack, defense, intelligence, mentality)
JOIN "player" p ON p."name" = v.player_name
JOIN "championship" c ON c."title" = 'COPA NABOR' AND c."created_at"::date = DATE '2026-03-21'
ON CONFLICT ("player_id", "championship_id") DO UPDATE SET
    "taken_at" = EXCLUDED."taken_at",
    "scale" = EXCLUDED."scale",
    "raw_overall" = EXCLUDED."raw_overall",
    "overall" = EXCLUDED."overall",
    "attack" = EXCLUDED."attack",
    "defense" = EXCLUDED."defense",
    "intelligence" = EXCLUDED."intelligence",
    "mentality" = EXCLUDED."mentality";
