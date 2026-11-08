-- Imports the rating history from the group's ratings document.
--
-- One row per player per cup: the rating as it stood after that cup.
--   * Old system (cups up to Dec 2024): a single overall from 1 to 5. It is kept
--     as-is in raw_overall, and converted to 0-100 in overall with
--         overall = round(42.9 + 10.12 * raw)
--     (a straight-line fit between each player's Dec 2024 rating and their first
--     0-100 rating in Jun 2025). Attributes did not exist yet, so they stay NULL.
--   * New system (from Jun 2025): overall and the four attributes, exactly as
--     written in the document.
--
-- Rows are matched to players by name and to cups by title and date, so this only
-- inserts where both exist and never changes existing data. Moroni (not in the
-- database) and Bot (not a player) are left out.

INSERT INTO "player_rating_snapshot"
    ("id", "player_id", "championship_id", "taken_at", "scale", "raw_overall", "overall", "attack", "defense", "intelligence", "mentality")
SELECT
    gen_random_uuid()::text, p."id", c."id", c."created_at", v.scale, v.raw_overall, v.overall,
    v.attack, v.defense, v.intelligence, v.mentality
FROM (VALUES
    ('COPA NABOR', DATE '2024-04-07', 'Ferreira', 'LEGACY_5', 5.0, 94, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA NABOR', DATE '2024-04-07', 'Leo', 'LEGACY_5', 4.4, 87, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA NABOR', DATE '2024-04-07', 'Thiago', 'LEGACY_5', 3.9, 82, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA NABOR', DATE '2024-04-07', 'Stertz', 'LEGACY_5', 3.7, 80, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA NABOR', DATE '2024-04-07', 'Pedro', 'LEGACY_5', 3.5, 78, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA NABOR', DATE '2024-04-07', 'Bauer', 'LEGACY_5', 3.5, 78, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA NABOR', DATE '2024-04-07', 'Cansan', 'LEGACY_5', 3.0, 73, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DOUGLAS', DATE '2024-06-23', 'Ferreira', 'LEGACY_5', 5.0, 94, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DOUGLAS', DATE '2024-06-23', 'Leo', 'LEGACY_5', 4.7, 90, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DOUGLAS', DATE '2024-06-23', 'Stertz', 'LEGACY_5', 3.7, 80, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DOUGLAS', DATE '2024-06-23', 'Thiago', 'LEGACY_5', 3.6, 79, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DOUGLAS', DATE '2024-06-23', 'Cansan', 'LEGACY_5', 3.6, 79, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DOUGLAS', DATE '2024-06-23', 'Pedro', 'LEGACY_5', 3.4, 77, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DOUGLAS', DATE '2024-06-23', 'Bauer', 'LEGACY_5', 3.4, 77, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DOUGLAS', DATE '2024-06-23', 'Cruz', 'LEGACY_5', 2.0, 63, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DEIVES', DATE '2024-12-14', 'Ferreira', 'LEGACY_5', 4.8, 91, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DEIVES', DATE '2024-12-14', 'Leo', 'LEGACY_5', 4.8, 91, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DEIVES', DATE '2024-12-14', 'Stertz', 'LEGACY_5', 3.6, 79, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DEIVES', DATE '2024-12-14', 'Thiago', 'LEGACY_5', 3.8, 81, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DEIVES', DATE '2024-12-14', 'Cansan', 'LEGACY_5', 3.4, 77, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DEIVES', DATE '2024-12-14', 'Pedro', 'LEGACY_5', 3.5, 78, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DEIVES', DATE '2024-12-14', 'Bauer', 'LEGACY_5', 3.4, 77, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA DEIVES', DATE '2024-12-14', 'Cruz', 'LEGACY_5', 2.8, 71, NULL::int, NULL::int, NULL::int, NULL::int),
    ('COPA POLAR', DATE '2025-06-28', 'Stertz', 'POINTS_100', 84.0, 84, 80, 82, 87, 90),
    ('COPA POLAR', DATE '2025-06-28', 'Bauer', 'POINTS_100', 78.0, 78, 76, 74, 82, 80),
    ('COPA POLAR', DATE '2025-06-28', 'Leo', 'POINTS_100', 87.0, 87, 96, 90, 98, 65),
    ('COPA POLAR', DATE '2025-06-28', 'Cruz', 'POINTS_100', 68.0, 68, 65, 63, 60, 85),
    ('COPA POLAR', DATE '2025-06-28', 'Thiago', 'POINTS_100', 84.0, 84, 88, 83, 84, 82),
    ('COPA POLAR', DATE '2025-06-28', 'Ferreira', 'POINTS_100', 93.0, 93, 98, 94, 92, 90),
    ('COPA POLAR', DATE '2025-06-28', 'Cansan', 'POINTS_100', 73.0, 73, 72, 70, 74, 78),
    ('COPA POLAR', DATE '2025-06-28', 'Pedro', 'POINTS_100', 81.0, 81, 82, 81, 79, 82),
    ('COPA CHILELA', DATE '2025-07-11', 'Stertz', 'POINTS_100', 86.0, 86, 84, 84, 88, 91),
    ('COPA CHILELA', DATE '2025-07-11', 'Bauer', 'POINTS_100', 76.0, 76, 74, 72, 82, 79),
    ('COPA CHILELA', DATE '2025-07-11', 'Leo', 'POINTS_100', 90.0, 90, 99, 92, 98, 72),
    ('COPA CHILELA', DATE '2025-07-11', 'Cruz', 'POINTS_100', 67.0, 67, 65, 62, 60, 84),
    ('COPA CHILELA', DATE '2025-07-11', 'Thiago', 'POINTS_100', 83.0, 83, 88, 81, 84, 80),
    ('COPA CHILELA', DATE '2025-07-11', 'Ferreira', 'POINTS_100', 91.0, 91, 97, 91, 88, 90),
    ('COPA CHILELA', DATE '2025-07-11', 'Cansan', 'POINTS_100', 72.0, 72, 71, 68, 74, 75),
    ('COPA CHILELA', DATE '2025-07-11', 'Pedro', 'POINTS_100', 85.0, 85, 87, 85, 82, 86)
) AS v(title, cup_date, player_name, scale, raw_overall, overall, attack, defense, intelligence, mentality)
JOIN "player" p ON p."name" = v.player_name
JOIN "championship" c ON c."title" = v.title AND c."created_at"::date = v.cup_date
ON CONFLICT ("player_id", "championship_id") DO NOTHING;
