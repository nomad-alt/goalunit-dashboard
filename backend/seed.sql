INSERT INTO
    clubs (
        club_id,
        competition_name,
        season_name,
        club_name,
        club_image_url,
        transfer_kpi,
        total_assets,
        total_revenues
    )
VALUES (
        1255,
        'Premier League',
        '2023/2024',
        'Arsenal',
        'https://cdn5.wyscout.com/photos/team/public/21_120x120.png',
        31.6,
        1154556000,
        678238000
    ),
    (
        2121,
        'Premier League',
        '2023/2024',
        'Liverpool',
        'https://cdn5.wyscout.com/photos/team/public/24_120x120.png',
        21.7,
        911160000,
        675141000
    ),
    (
        2175,
        'Premier League',
        '2023/2024',
        'Manchester City',
        'https://cdn5.wyscout.com/photos/team/public/23_120x120.png',
        36.3,
        1686533000,
        791422000
    ),
    (
        2188,
        'Premier League',
        '2023/2024',
        'Manchester United',
        'https://cdn5.wyscout.com/photos/team/public/22_120x120.png',
        39.7,
        2121511000,
        739449000
    ),
    (
        1255,
        'Premier League',
        '2024/2025',
        'Arsenal',
        'https://cdn5.wyscout.com/photos/team/public/21_120x120.png',
        22.7,
        1132451000,
        760097000
    ),
    (
        2121,
        'Premier League',
        '2024/2025',
        'Liverpool',
        'https://cdn5.wyscout.com/photos/team/public/24_120x120.png',
        12.7,
        897169000,
        787175000
    ),
    (
        2175,
        'Premier League',
        '2024/2025',
        'Manchester City',
        'https://cdn5.wyscout.com/photos/team/public/23_120x120.png',
        25.5,
        2183403000,
        766622000
    ),
    (
        2188,
        'Premier League',
        '2024/2025',
        'Manchester United',
        'https://cdn5.wyscout.com/photos/team/public/22_120x120.png',
        26.5,
        2458064000,
        741317000
    ) ON CONFLICT (club_id, season_name) DO
UPDATE
SET
    transfer_kpi = EXCLUDED.transfer_kpi,
    total_assets = EXCLUDED.total_assets,
    total_revenues = EXCLUDED.total_revenues;

INSERT INTO
    players (
        player_id,
        season_id,
        season_name,
        player_name,
        fair_price,
        contract_expiration,
        age,
        position,
        nationality
    )
VALUES (
        328209,
        862,
        '2024/2025',
        'Erling Haaland',
        197384771,
        '2034-06-30',
        24,
        'Centre-forward',
        'Norway'
    ),
    (
        385494,
        862,
        '2024/2025',
        'Bukayo Saka',
        130024906,
        '2027-06-30',
        24,
        'Right winger',
        'England'
    ),
    (
        342411,
        862,
        '2024/2025',
        'Phil Foden',
        113740798,
        '2027-06-30',
        25,
        'Attacking midfielder',
        'England'
    ),
    (
        299748,
        862,
        '2024/2025',
        'Declan Rice',
        110001138,
        '2028-06-30',
        26,
        'Defensive midfielder',
        'England'
    ),
    (
        258117,
        862,
        '2024/2025',
        'Martin Ødegaard',
        96485573,
        '2028-06-30',
        26,
        'Attacking midfielder',
        'Norway'
    ),
    (
        426448,
        862,
        '2024/2025',
        'William Saliba',
        79009240,
        '2027-06-30',
        24,
        'Centre-back',
        'France'
    ),
    (
        409931,
        862,
        '2024/2025',
        'Gabriel Martinelli',
        61752995,
        '2027-06-30',
        24,
        'Left winger',
        'Brazil'
    ),
    (
        320421,
        862,
        '2024/2025',
        'Gabriel Magalhães',
        59161995,
        '2027-06-30',
        27,
        'Centre-back',
        'Brazil'
    ),
    (
        365347,
        862,
        '2024/2025',
        'Jurrien Timber',
        58887071,
        '2028-06-30',
        24,
        'Right-back',
        'Netherlands'
    ),
    (
        341716,
        862,
        '2024/2025',
        'Ben White',
        37125854,
        '2028-06-30',
        27,
        'Right-back',
        'England'
    ),
    (
        157546,
        862,
        '2024/2025',
        'Leandro Trossard',
        29994298,
        '2026-06-30',
        30,
        'Left winger',
        'Belgium'
    ),
    (
        271857,
        862,
        '2024/2025',
        'Gabriel Jesus',
        27689477,
        '2027-06-30',
        28,
        'Centre-forward',
        'Brazil'
    ) ON CONFLICT (player_id, season_id) DO
UPDATE
SET
    fair_price = EXCLUDED.fair_price,
    contract_expiration = EXCLUDED.contract_expiration,
    age = EXCLUDED.age,
    position = EXCLUDED.position,
    nationality = EXCLUDED.nationality;

INSERT INTO
    player_club_assignments (
        player_id,
        season_id,
        season_name,
        club_id
    )
VALUES (
        328209,
        862,
        '2024/2025',
        2175
    ),
    (
        385494,
        862,
        '2024/2025',
        1255
    ),
    (
        342411,
        862,
        '2024/2025',
        2175
    ),
    (
        299748,
        862,
        '2024/2025',
        1255
    ),
    (
        258117,
        862,
        '2024/2025',
        1255
    ),
    (
        426448,
        862,
        '2024/2025',
        1255
    ),
    (
        409931,
        862,
        '2024/2025',
        1255
    ),
    (
        320421,
        862,
        '2024/2025',
        1255
    ),
    (
        365347,
        862,
        '2024/2025',
        1255
    ),
    (
        341716,
        862,
        '2024/2025',
        1255
    ),
    (
        157546,
        862,
        '2024/2025',
        1255
    ),
    (
        271857,
        862,
        '2024/2025',
        1255
    ) ON CONFLICT (player_id, season_id) DO
UPDATE
SET
    club_id = EXCLUDED.club_id,
    season_name = EXCLUDED.season_name;
