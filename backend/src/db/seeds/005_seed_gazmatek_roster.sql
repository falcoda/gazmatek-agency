-- Seed: Gazmatek roster mirrored from the reference site
-- (gazmatekWebsite/src/content/artists.ts). Bios use the long FR/EN versions
-- when available, NL falls back to the EN copy for now. Pricing is now derived
-- from artist_level (L1–L4) at quote time, not stored per artist.

INSERT INTO artists (
  slug, stage_name, bio_fr, bio_nl, bio_en,
  genre, is_published, is_featured, cover_image_url
) VALUES
  ('cantik', 'CANTIK',
   'Originaire du nord de la France, c''est en 2007 que Cantik découvre l''univers de la Rave. À cette époque, la Hardtek domine les dancefloors, et c''est lors de ses rencontres avec des figures emblématiques telles que Billx, Floxytek, Mat Weasel Buster, ainsi que certains membres du crew Narkotek, que naît le désir de créer. Ses premières tracks voient le jour en 2008. Depuis lors, son style s''est affiné, intégrant des influences trance, dubstep, drum''n''bass et frenchcore dans ses nouvelles productions. Sa philosophie reste la même depuis ses débuts : créer une musique positive et énergisante !',
   'From northern France, Cantik discovered the rave scene in 2007. At the time, Hardtek dominated the dancefloors, and it was through encounters with iconic figures such as Billx, Floxytek, Mat Weasel Buster and members of the Narkotek crew that the desire to create was born. His first tracks appeared in 2008. Since then his style has evolved, incorporating trance, dubstep, drum''n''bass and frenchcore influences. His philosophy has never changed: create positive, energizing music.',
   'From northern France, Cantik discovered the rave scene in 2007. At the time, Hardtek dominated the dancefloors, and it was through encounters with iconic figures such as Billx, Floxytek, Mat Weasel Buster and members of the Narkotek crew that the desire to create was born. His first tracks appeared in 2008. Since then his style has evolved, incorporating trance, dubstep, drum''n''bass and frenchcore influences. His philosophy has never changed: create positive, energizing music.',
   'Hardtek', TRUE, TRUE, NULL),

  ('albiovix', 'ALBIOVIX',
   'Après des années à fréquenter les concerts de metal, hardcore et death core ainsi que des festivals depuis l''âge de 14 ans, Thomas, né en Belgique en 1994, a été présenté à la musique underground free tekno par son frère en 2016 à l''âge de 21 ans. Il a rapidement ressenti un besoin naturel de recréer et d''exprimer ces énergies sombres. Il a commencé à produire depuis le début de 2017 lors de diverses fêtes gratuites. Albiovix a été invité en tant que résident de Gazmatek Records.',
   'After years attending metal, hardcore and death core concerts and festivals from the age of 14, Thomas — born in Belgium in 1994 — was introduced to underground free tekno music by his brother in 2016. He began producing in early 2017 at various free parties, and was soon invited to join Gazmatek Records as a resident.',
   'After years attending metal, hardcore and death core concerts and festivals from the age of 14, Thomas — born in Belgium in 1994 — was introduced to underground free tekno music by his brother in 2016. He began producing in early 2017 at various free parties, and was soon invited to join Gazmatek Records as a resident.',
   'Acid Tekno', TRUE, TRUE, NULL),

  ('briouk', 'BRIOUCH''K',
   'Artiste belge issu des cercles underground, Briouch''K est un producteur de Mental Tekno qui aime créer des atmosphères singulières à travers des ambiances dark. Il vous fera danser avec un rythme palpitant !',
   'A Belgian artist from the underground scene, Briouch''K is a Mental Tekno producer who crafts singular atmospheres through dark moods. He will make you dance to a pounding rhythm.',
   'A Belgian artist from the underground scene, Briouch''K is a Mental Tekno producer who crafts singular atmospheres through dark moods. He will make you dance to a pounding rhythm.',
   'Mental Tekno', TRUE, FALSE, NULL),

  ('butternut', 'BUTTERNUT',
   'Originaire de Nantes en France, Butternut produit de la musique électronique hard, du hardtekno, de l''underground tekno, de la psytrance et du tekno. Ses morceaux se caractérisent par des passages d''intro jungle qui se transforment en tracks minimal de style hardfloor autour de 180 BPM.',
   'From Nantes, France, Butternut produces hardtekno, underground tekno, psytrance and tekno. His tracks are characterised by jungle-style intro passages that evolve into minimal, Hardfloor-influenced patterns around 180 BPM.',
   'From Nantes, France, Butternut produces hardtekno, underground tekno, psytrance and tekno. His tracks are characterised by jungle-style intro passages that evolve into minimal, Hardfloor-influenced patterns around 180 BPM.',
   'Hardtekno', TRUE, FALSE, NULL),

  ('ecleptix', 'ECLEPTIX',
   'Label DJ directement importé du cœur de la Belgique, Ecleptix plonge dans un mix hybride énergétique allant du Hi-Tech groovy au Hardtek percutant avec même des touches de Frenchcore. Sa mission : proposer la musique la plus groovy et la plus lourde possible pour faire danser les foules.',
   'A label DJ imported directly from the heart of Belgium, Ecleptix dives into an energetic hybrid mix ranging from groovy Hi-Tech to hard-hitting Hardtek with touches of Frenchcore. His mission: to deliver the grooviest and heaviest music possible to get crowds dancing.',
   'A label DJ imported directly from the heart of Belgium, Ecleptix dives into an energetic hybrid mix ranging from groovy Hi-Tech to hard-hitting Hardtek with touches of Frenchcore.',
   'Hi-Tech', TRUE, TRUE, NULL),

  ('ekwazz', 'EKWAZZ',
   'Artiste résident du collectif Gazmatek, Ekwazz fait partie de la scène tekno underground belge.',
   'Resident artist of the Gazmatek collective, Ekwazz is part of the Belgian underground tekno scene.',
   'Resident artist of the Gazmatek collective, Ekwazz is part of the Belgian underground tekno scene.',
   'Tekno', TRUE, FALSE, NULL),

  ('electromancien', 'L''ELECTROMANCIEN',
   'Artiste basé à Bruxelles, L''Electromancien évolue dans les genres électronique, frenchcore, IDM, breakcore et tekno. Il combine des influences tekno et hardtek avec des éléments de musique électronique expérimentale. Il a sorti l''EP The Story Of Teknocore sur Gazmatek Records.',
   'Brussels-based, L''Electromancien moves through electronic, frenchcore, IDM, breakcore and tekno genres. He combines tekno and hardtek influences with experimental electronic music. He released the EP The Story Of Teknocore on Gazmatek Records.',
   'Brussels-based, L''Electromancien moves through electronic, frenchcore, IDM, breakcore and tekno genres. He combines tekno and hardtek influences with experimental electronic music.',
   'Tekno', TRUE, FALSE, NULL),

  ('etat-zero', 'ETAT ZERO',
   'Artiste résident du collectif Gazmatek, Etat Zero fait partie de la scène tekno underground belge.',
   'Resident artist of the Gazmatek collective, Etat Zero is part of the Belgian underground tekno scene.',
   'Resident artist of the Gazmatek collective, Etat Zero is part of the Belgian underground tekno scene.',
   'Tekno', TRUE, FALSE, NULL),

  ('exil3', 'EX!L3',
   'EX!L3 est un artiste de la scène tekno underground belge, résident chez Gazmatek.',
   'EX!L3 is a Belgian underground tekno artist, resident at Gazmatek.',
   'EX!L3 is a Belgian underground tekno artist, resident at Gazmatek.',
   'Tekno', TRUE, FALSE, NULL),

  ('fuzzey', 'FUZZEY',
   'Artiste indépendant multi-instrumentiste qui compose des compositions originales dans plusieurs styles différents. Fuzzey est également le leader, compositeur et producteur du groupe GLITCHH.',
   'An independent multi-instrumentalist who composes original compositions across several different styles. Fuzzey is also the leader, composer and producer of the group GLITCHH.',
   'An independent multi-instrumentalist who composes original compositions across several different styles. Fuzzey is also the leader, composer and producer of the group GLITCHH.',
   'Multi-genre', TRUE, FALSE, NULL),

  ('ganjaflexx', 'GANJAFLEXX',
   'DJ résident chez Gazmatek, Atohm et Foorsystem, GanjaFlexx travaille avec du vinyle et les timecodes Traktor. Ses morceaux se distinguent par leur énergie contagieuse et leurs basslines pulsantes.',
   'Resident DJ at Gazmatek, Atohm and Foorsystem, GanjaFlexx works with vinyl and Traktor timecodes. His tracks are distinguished by their contagious energy and pulsing basslines.',
   'Resident DJ at Gazmatek, Atohm and Foorsystem, GanjaFlexx works with vinyl and Traktor timecodes.',
   'Tekno', TRUE, FALSE, NULL),

  ('g-little', 'G-LITTLE',
   'G-Little est un artiste résident du collectif Gazmatek.',
   'G-Little is a resident artist of the Gazmatek collective.',
   'G-Little is a resident artist of the Gazmatek collective.',
   'Tekno', TRUE, FALSE, NULL),

  ('kemikal-crow', 'KEMIKAL CROW',
   'Le projet Kemikal Crow est un voyage auditif mental qui repousse constamment les limites du politiquement correct ainsi que les normes standard fixées par l''industrie de la musique. Hardware liveset depuis 2005.',
   'The Kemikal Crow project is a mental auditory journey that constantly pushes the limits of political correctness as well as the standard norms set by the music industry. Hardware liveset since 2005.',
   'The Kemikal Crow project is a mental auditory journey. Hardware liveset since 2005.',
   'Breakcore', TRUE, TRUE, NULL),

  ('kromozom', 'KROMOZOM',
   'Kromozom est un artiste résident du collectif Gazmatek.',
   'Kromozom is a resident artist of the Gazmatek collective.',
   'Kromozom is a resident artist of the Gazmatek collective.',
   'Tekno', TRUE, FALSE, NULL),

  ('lemma', 'LEMMA',
   'Lemma est un artiste résident du collectif Gazmatek.',
   'Lemma is a resident artist of the Gazmatek collective.',
   'Lemma is a resident artist of the Gazmatek collective.',
   'Tekno', TRUE, FALSE, NULL),

  ('meven', 'MEVEN',
   'Meven, producteur de Hard Techno, résident chez Gazmatek.',
   'Meven, Hard Techno producer, resident at Gazmatek.',
   'Meven, Hard Techno producer, resident at Gazmatek.',
   'Hard Techno', TRUE, FALSE, NULL),

  ('minopolska', 'MINOPOLSKA',
   'DJ et productrice de Hard Techno originaire de Belgique, Minopolska prêche la techno depuis 2009. Résidente chez Gazmatek, elle fait partie intégrante de la scène tekno bruxelloise.',
   'Belgian Hard Techno DJ and producer, Minopolska has been preaching techno since 2009. A resident at Gazmatek, she is an integral part of the Brussels tekno scene.',
   'Belgian Hard Techno DJ and producer, Minopolska has been preaching techno since 2009.',
   'Hard Techno', TRUE, TRUE, NULL),

  ('mixsaj', 'MIXSAJ',
   'Basée à Bruxelles avec des racines bosniaques, Mixsaj est une figure montante de la scène électronique indépendante. Mélangeant techno, hard trance et hard bounce, elle délivre une énergie intense pour plonger la foule dans une transe collective.',
   'Based in Brussels with Bosnian roots, Mixsaj is a rising figure in the independent electronic scene. Blending techno, hard trance and hard bounce, she delivers intense energy designed to keep the crowd in a collective trance.',
   'Based in Brussels with Bosnian roots, Mixsaj is a rising figure in the independent electronic scene.',
   'Techno', TRUE, TRUE, NULL),

  ('mobykick', 'MOBYKICK',
   'Co-fondateur de Gazmatek, Mobykick s''installe à Bruxelles en 2013. Son projet mêle acid mélodieux et kick bass gargantuesque, oscillant entre ses origines, ses influences et une technicité vivante et organique.',
   'Co-founder of Gazmatek, Mobykick settled in Brussels in 2013. His project blends melodic acid with colossal kick bass, oscillating between his origins, influences and a living, organic technicality.',
   'Co-founder of Gazmatek, Mobykick settled in Brussels in 2013.',
   'Acid Tekno', TRUE, TRUE, NULL),

  ('moracid', 'MORACID',
   'Producteur de musique belge, Moracid a commencé à produire à l''âge de 16 ans en utilisant FL Studio 8. Membre du crew Gazmatek, il a sorti des tracks comme Mental Rec et Raspoutine sur le label Gazmatek Records.',
   'Belgian music producer, Moracid began producing at the age of 16 using FL Studio 8. A member of the Gazmatek crew, he has released tracks such as Mental Rec and Raspoutine on the Gazmatek Records label.',
   'Belgian music producer, Moracid began producing at the age of 16 using FL Studio 8.',
   'Tekno', TRUE, FALSE, NULL),

  ('nocid', 'NOCID',
   'En 2005, Nocid s''installe à Liège et crée les événements Escape to Acid. Il a été invité à travers toute la Belgique, la France, le Luxembourg, l''Allemagne et les Pays-Bas. En 2019, il crée l''Escape Club Underground.',
   'In 2005, Nocid settled in Liège and created the Escape to Acid events. He has performed across Belgium, France, Luxembourg, Germany and the Netherlands. In 2019 he founded Escape Club Underground.',
   'In 2005, Nocid settled in Liège and created the Escape to Acid events.',
   'Acid Tekno', TRUE, TRUE, NULL),

  ('n-x', 'N X',
   'N X est un producteur et performeur live Tekno. Ses sets intenses et sombres, rythmés par des basses puissantes, plongent le public dans un voyage où l''obscurité se métamorphose en une expérience lumineuse et transcendante. Cofondateur du soundsystem bruxellois Bankal.',
   'N X is a Tekno producer and live performer. His intense and dark sets, driven by powerful basslines, take the audience on a journey where darkness transforms into a luminous and transcendent experience. Co-founder of the Brussels-based soundsystem Bankal.',
   'N X is a Tekno producer and live performer.',
   'Acid-Tek', TRUE, TRUE, NULL),

  ('olibrius', 'OLIBRIUS',
   'Associé à Legz Breakerz et Gazmatek, faisant partie du PLT & GTK krew, Olibrius est également impliqué avec Indiscret, MCSTB et Dissonant Tekno Records. Ses releases incluent Transelucid 07, Mental Assembly V.3 et Engraine 0.',
   'Associated with Legz Breakerz and Gazmatek, part of the PLT & GTK krew, Olibrius is also involved with Indiscret, MCSTB and Dissonant Tekno Records. His releases include Transelucid 07, Mental Assembly V.3 and Engraine 0.',
   'Associated with Legz Breakerz and Gazmatek, Olibrius is a key player in the underground tekno scene.',
   'Tekno', TRUE, FALSE, NULL),

  ('raik', 'RAIK',
   'Raik, DJ et producteur tekno belge, résident chez Gazmatek.',
   'Raik, Belgian tekno DJ and producer, resident at Gazmatek.',
   'Raik, Belgian tekno DJ and producer, resident at Gazmatek.',
   'Tekno', TRUE, FALSE, NULL),

  ('rk-project', 'R.K PROJECT',
   'R.K Project est un artiste résident chez Gazmatek Records, avec la release Ride The Vibe sur le label.',
   'R.K Project is a resident artist at Gazmatek Records, with the release Ride The Vibe on the label.',
   'R.K Project is a resident artist at Gazmatek Records.',
   'Tekno', TRUE, FALSE, NULL),

  ('same', 'SAME',
   'SAME est un artiste résident du collectif Gazmatek.',
   'SAME is a resident artist of the Gazmatek collective.',
   'SAME is a resident artist of the Gazmatek collective.',
   'Tekno', TRUE, FALSE, NULL),

  ('sekter4', 'SEKTER4',
   'Sekter4 est un artiste résident du collectif Gazmatek.',
   'Sekter4 is a resident artist of the Gazmatek collective.',
   'Sekter4 is a resident artist of the Gazmatek collective.',
   'Tekno', TRUE, FALSE, NULL),

  ('sevenum-six', 'SEVENUM SIX',
   'Sevenum Six a commencé la musique électronique à l''âge de 17 ans en 2008. Il fait partie du collectif Cult Collective associé à Gazmatek et a contribué au premier vinyle Gazmatek Records 01 avec le track Human Perception.',
   'Sevenum Six began making electronic music at the age of 17 in 2008. He is a member of the Cult Collective associated with Gazmatek and contributed the track Human Perception to the first Gazmatek Records vinyl release.',
   'Sevenum Six began making electronic music at the age of 17 in 2008.',
   'Acid Tekno', TRUE, TRUE, NULL),

  ('shmykblick', 'SHMYKBLICK',
   'Artiste liégeois membre du collectif Avotrez, Shmykblick performe en analog live set avec ses Elektrons. Il crée des univers sombres, rythmiques et explosifs issus de la culture free party underground.',
   'A Liège-based artist and member of the Avotrez collective, Shmykblick performs analog live sets with Elektron hardware, crafting dark, rhythmic and explosive soundscapes rooted in underground free party culture.',
   'A Liège-based artist and member of the Avotrez collective, Shmykblick performs analog live sets with Elektron hardware.',
   'Dark Tekno', TRUE, TRUE, NULL),

  ('soul3d', 'SOUL3D',
   'Soul3d a commencé à écouter de la musique électronique très jeune, son père étant DJ et collectionneur de vinyles depuis les années 1970. Sa philosophie musicale : VINYL RULES. Résident chez Gazmatek.',
   'Soul3d began listening to electronic music very young, his father being a DJ and vinyl collector since the 1970s. His musical philosophy: VINYL RULES. A resident at Gazmatek.',
   'Soul3d began listening to electronic music very young.',
   'Tekno', TRUE, FALSE, NULL),

  ('staterak', 'STATERAK',
   'L''histoire musicale de Staterak commence en 2019 lorsqu''il reçoit FL Studio comme instrument lors d''une fête. Depuis, il a développé son univers sonore et rejoint le collectif Gazmatek en tant que résident.',
   'Staterak''s musical journey began in 2019 when he received FL Studio as a gift at a party. Since then he has developed his sonic universe and joined the Gazmatek collective as a resident.',
   'Staterak''s musical journey began in 2019.',
   'Tekno', TRUE, FALSE, NULL),

  ('suarez', 'SUAREZ',
   'Suarez, artiste résident du collectif Gazmatek.',
   'Suarez, resident artist of the Gazmatek collective.',
   'Suarez, resident artist of the Gazmatek collective.',
   'Tekno', TRUE, FALSE, NULL),

  ('tekiapy-mobitekk', 'TEKIAPY & MOBITEKK',
   'Tekiapy est DJ/Productrice depuis 2011, résidente chez Gazmatek ainsi que chez Éphémère & Keereki Were Soundsystem et Bad Station Radio Livestream. Ensemble avec Mobitekk, ils forment un duo de la scène tekno underground.',
   'Tekiapy has been a DJ and producer since 2011, resident at Gazmatek as well as Éphémère & Keereki Were Soundsystem and Bad Station Radio Livestream. Together with Mobitekk they form a duo of the underground tekno scene.',
   'Tekiapy & Mobitekk, underground tekno duo, residents at Gazmatek.',
   'Tekno', TRUE, TRUE, NULL),

  ('terapeutek', 'TERAPEUTEK',
   'DJ underground originaire de France, actif depuis les années 2000, Terapeutek est passionné par le mix vinyle. Co-fondateur du Gazmatek Sound System en Belgique créé en 2016, il produit désormais les artistes du crew et découvre de nouveaux talents.',
   'An underground DJ from France, active since the early 2000s, Terapeutek is passionate about vinyl mixing. Co-founder of the Gazmatek Sound System in Belgium in 2016, he now produces the crew''s artists and discovers new talent.',
   'Co-founder of the Gazmatek Sound System, Terapeutek is a vinyl DJ of Tribe and Hardtek.',
   'Tribe', TRUE, TRUE, NULL),

  ('toxyblue', 'TOXYBLUE',
   'TØXYBLUE est une productrice musicale belgo-italienne issue d''une famille de musiciens et passionnée de musique depuis son enfance. Multi-instrumentiste et chanteuse, elle fusionne aujourd''hui son univers avec l''énergie brute de la scène rave pour créer un son hybride innovant.',
   'TØXYBLUE is a Belgian-Italian music producer from a family of musicians, passionate about music since childhood. A multi-instrumentalist and singer, she fuses her world with the raw energy of the rave scene to create an innovative hybrid sound.',
   'TØXYBLUE is a Belgian-Italian music producer.',
   'Hardpsy', TRUE, TRUE, NULL),

  ('vizitor23', 'VIZITOR 23',
   'Vizitor 23 est un artiste résident du collectif Gazmatek.',
   'Vizitor 23 is a resident artist of the Gazmatek collective.',
   'Vizitor 23 is a resident artist of the Gazmatek collective.',
   'Tekno', TRUE, FALSE, NULL),

  ('zetro23', 'ZETRO23',
   'DJ/producteur depuis 2018, originaire du nord de la France. Adepte du "ONLY LIVE, NO MASTER", Zetro23 produit exclusivement en live avec du matériel hardware comme le Korg EMX, ER1mk2 et EA1. Résident chez Gazmatek.',
   'DJ/producer since 2018, originally from northern France. A devotee of "ONLY LIVE, NO MASTER", Zetro23 produces exclusively live using hardware such as the Korg EMX, ER1mk2 and EA1. A resident at Gazmatek.',
   'DJ/producer since 2018, Zetro23 produces exclusively live with hardware.',
   'Tekno', TRUE, FALSE, NULL)
ON CONFLICT (slug) DO NOTHING;
