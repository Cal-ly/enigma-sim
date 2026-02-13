import type { HistoryChapter } from '../types';

export const historyContent: HistoryChapter[] = [
  {
    id: 'the-machine',
    title: 'The Machine',
    sections: [
      {
        id: 'origins',
        title: 'Origins and Invention',
        paragraphs: [
          'The Enigma machine was invented by German engineer Arthur Scherbius in 1918, shortly after the end of World War I. Scherbius patented the design and, along with Richard Ritter, founded the company Chiffriermaschinen Aktiengesellschaft to manufacture and sell the devices commercially. The earliest models were marketed to businesses for securing corporate communications, but initial commercial sales were disappointing.',
          'The German military recognized the potential of electro-mechanical encryption far sooner than most other nations. The Reichswehr (later Wehrmacht) adopted a modified version of the commercial Enigma in 1926, and the Kriegsmarine followed in 1926–1928. By the mid-1930s, the Enigma had become the primary tactical cipher machine for all branches of the German armed forces, with over 40,000 machines eventually produced during the war years.',
        ],
      },
      {
        id: 'how-it-works',
        title: 'How It Works',
        paragraphs: [
          'At its core, the Enigma is a polyalphabetic substitution cipher implemented through electro-mechanical means. When an operator presses a key, an electrical current flows through a series of components — the plugboard, three (or sometimes four) rotating cipher rotors, a fixed reflector, and back through the rotors and plugboard again — before illuminating a lamp on the lampboard that indicates the encrypted letter.',
          'Each rotor contains an internal wiring that maps each of the 26 input contacts to a different output contact, effectively performing a simple substitution. Because the rotors step with each keypress — much like an odometer — the substitution changes after every letter. The right rotor advances one position per keypress, the middle rotor advances when the right rotor reaches its notch position, and the left rotor advances when the middle rotor reaches its own notch.',
          'The reflector is a crucial component: it ensures that the electrical signal passes through the rotors twice (once forward and once in reverse), which guarantees that encryption is its own inverse — pressing A to get B means pressing B with the same settings produces A. This self-reciprocal property was operationally convenient, since the same machine and settings could be used for both encryption and decryption. However, the reflector also introduced a fatal cryptographic weakness: no letter could ever encrypt to itself.',
          'The plugboard (Steckerbrett), added to military models, provides an additional substitution layer by swapping pairs of letters before and after the rotor stage. With up to 13 pairs connected, the plugboard contributed the majority of the machine\'s theoretical key space — approximately 150 trillion possible plugboard configurations alone.',
        ],
      },
      {
        id: 'double-step',
        title: 'The Double-Stepping Anomaly',
        paragraphs: [
          'The Enigma\'s rotor stepping mechanism contains a mechanical quirk known as the "double-step" anomaly. Under normal operation, only the rightmost rotor steps with each keypress. However, when the middle rotor is at its notch position, it steps again when advancing the left rotor — meaning it moves on two consecutive keypresses rather than just one.',
          'This anomaly arose from the mechanical design: the same pawl-and-ratchet mechanism that causes the middle rotor to advance the left rotor also advances the middle rotor itself. The double-step slightly reduces the effective period of the rotor cycle from the theoretical 26 × 26 × 26 = 17,576 positions, though its cryptographic impact was relatively minor compared to other weaknesses.',
        ],
      },
      {
        id: 'key-space',
        title: 'The Key Space',
        paragraphs: [
          'The total number of possible Enigma configurations is staggering. Considering three rotors chosen from five (60 arrangements), 26³ starting positions (17,576), 26³ ring settings (17,576), and the plugboard\'s approximately 150 trillion combinations, the theoretical key space exceeds 158 quintillion (1.58 × 10²⁰) possible settings.',
          'This enormous key space led the Germans to believe the Enigma was unbreakable by any practical means. And they were nearly right — brute-force attack was utterly infeasible with 1930s and 1940s technology. The machine was broken not through brute force but through a combination of brilliant mathematical insight, exploitation of procedural errors, and the inherent cryptographic flaw that no letter encrypts to itself.',
        ],
      },
    ],
  },
  {
    id: 'military-usage',
    title: 'Military Usage and Procedures',
    sections: [
      {
        id: 'daily-procedures',
        title: 'Daily Key Procedures',
        paragraphs: [
          'The German military distributed codebooks — known as key sheets — that specified the daily settings for each Enigma network. A key sheet entry for a given day would specify: the rotor order (which three rotors to install and in what positions), the ring settings for each rotor, the plugboard connections, and sometimes a ground setting or indicator procedure.',
          'Initially, the message key (the starting rotor positions for a specific message) was encrypted by sending it twice at the beginning of the transmission using the daily ground setting. For example, if the chosen message key was "ABC," the operator would first set the rotors to the daily ground position and encrypt "ABCABC," then reset to "ABC" and encrypt the actual message. This doubled indicator was a catastrophic procedural mistake that gave Polish cryptanalysts their first breakthrough.',
        ],
      },
      {
        id: 'networks',
        title: 'Enigma Networks',
        paragraphs: [
          'Different branches and units of the German military operated on separate Enigma networks, each with its own key sheets and procedures. The Wehrmacht had its own networks, the Luftwaffe had several, and the Kriegsmarine operated the most complex system with additional rotors (eight instead of five to choose from) and eventually four-rotor machines (the M4 Enigma).',
          'The naval Enigma was particularly important because it protected communications related to the U-boat campaign in the Battle of the Atlantic. Breaking the naval Enigma was critical to the Allied war effort, as it allowed convoy routing to avoid U-boat wolfpacks. The introduction of the four-rotor M4 in February 1942 caused a ten-month blackout in Allied naval intelligence — a period of significantly increased shipping losses.',
        ],
      },
      {
        id: 'operator-errors',
        title: 'Operator Errors and "Cribs"',
        paragraphs: [
          'Despite the theoretical strength of the Enigma system, its security was systematically undermined by operator habits and procedural failures. Many operators chose predictable message keys — sequences like "AAA," "ABC," or their girlfriend\'s initials — rather than truly random settings. Others used the same key for multiple messages.',
          'Allied cryptanalysts exploited "cribs" — known or guessed plaintext fragments. Common sources included stereotyped message openings (weather reports beginning with "WETTER" or "WETTERVORHERSAGE"), routine phrases, and messages whose content could be predicted from context. The German habit of re-encrypting the same message on different networks using different keys was another valuable source of breaks.',
          'Perhaps most famously, the fact that no letter could encrypt to itself (due to the reflector) was a negative crib of immense value. Cryptanalysts could slide a guessed plaintext along a ciphertext and eliminate any position where a letter aligned with itself, dramatically reducing the number of positions to test.',
        ],
      },
    ],
  },
  {
    id: 'codebreaking',
    title: 'Breaking the Enigma',
    sections: [
      {
        id: 'polish-work',
        title: 'The Polish Breakthrough',
        paragraphs: [
          'The first major breaks into Enigma were achieved not at Bletchley Park but by Polish mathematicians — a fact that deserves far more recognition than it typically receives. In 1932, mathematician Marian Rejewski, working at the Polish Cipher Bureau (Biuro Szyfrów) in Warsaw, accomplished what many considered impossible: he mathematically reconstructed the internal wiring of the Enigma rotors without ever having physically examined one.',
          'Rejewski exploited the doubled message key procedure, recognizing that the relationship between the first and fourth, second and fifth, and third and sixth characters of each indicator revealed information about the rotor wiring and positions. Using the theory of permutations and group theory, combined with commercial Enigma documentation obtained by French intelligence through the spy Hans-Thilo Schmidt (codenamed "Asche"), Rejewski deduced the complete wiring of the military Enigma\'s rotors.',
          'His colleagues Jerzy Różycki and Henryk Zygalski developed complementary techniques. Zygalski devised "Zygalski sheets" — perforated cardboard sheets that, when stacked and illuminated, revealed possible rotor settings. Rejewski designed the "Bomba" (Polish: Bomba kryptologiczna) — an electro-mechanical device that could test rotor settings at high speed. Note that the Polish Bomba, while inspirational, was architecturally quite different from the later British Bombe designed by Turing.',
        ],
      },
      {
        id: 'sharing-the-secret',
        title: 'Sharing the Secret',
        paragraphs: [
          'In July 1939, just weeks before the German invasion of Poland, the Polish Cipher Bureau shared their Enigma-breaking techniques with French and British intelligence at a meeting in the Kabaty Woods near Pyry, south of Warsaw. The British delegation, led by Alastair Denniston and Dilly Knox, was stunned — they had been making some progress on the commercial Enigma but had not broken the military version.',
          'The Poles also provided reconstructed Enigma machines and technical documentation. This transfer of knowledge was one of the most significant intelligence coups of the war. Without the Polish foundation, British codebreaking at Bletchley Park would have started from a far more difficult position, potentially delaying critical breakthroughs by months or years.',
        ],
      },
      {
        id: 'bletchley-park',
        title: 'Bletchley Park and the British Bombe',
        paragraphs: [
          'Building on the Polish work, British codebreakers at Bletchley Park — particularly Alan Turing and Gordon Welchman — developed more powerful methods to attack the increasingly complex Enigma system. The Germans had responded to suspected compromises by changing procedures, eliminating the doubled indicator and adding more rotors to choose from.',
          'Turing designed the British Bombe, a fundamentally different machine from Rejewski\'s Bomba. While the Polish Bomba exploited the doubled indicator (which the Germans had since abandoned), Turing\'s Bombe used a technique based on cribs — known or guessed plaintext. The Bombe could simultaneously test multiple rotor configurations, eliminating settings that led to contradictions and identifying the correct daily key.',
          'Gordon Welchman independently devised the "diagonal board," a crucial enhancement to Turing\'s Bombe design that exploited the reciprocal nature of the plugboard (if A is plugged to B, then B is plugged to A). This enhancement dramatically reduced the number of false stops and made the Bombe far more practical. The first operational Bombe, named "Victory," was installed in March 1940, and by the war\'s end, over 200 Bombes were in operation.',
        ],
      },
      {
        id: 'impact',
        title: 'Impact on the War',
        paragraphs: [
          'The intelligence derived from Enigma decrypts — codenamed "Ultra" — is widely regarded as one of the most significant factors in the Allied victory. Historians estimate that Ultra shortened the war in Europe by at least two years, potentially saving millions of lives.',
          'Ultra\'s impact was felt across every theater of the war. In the Battle of the Atlantic, decrypted U-boat communications allowed convoys to be routed away from wolfpacks. In North Africa, Montgomery\'s knowledge of Rommel\'s supply situation and plans contributed to the victory at El Alamein. Before D-Day, Ultra confirmed that German deception countermeasures were working and that the enemy expected the invasion at Pas-de-Calais rather than Normandy.',
          'The secret of Ultra was kept for nearly 30 years after the war ended. It was not until the publication of Frederick Winterbotham\'s book "The Ultra Secret" in 1974 that the story became public knowledge, leading to a fundamental reassessment of the war\'s history and the roles played by codebreakers on both sides.',
        ],
      },
      {
        id: 'legacy',
        title: 'Legacy',
        paragraphs: [
          'The breaking of the Enigma is more than a historical footnote — it represents a foundational moment in the history of computer science and modern cryptography. Turing\'s work on the Bombe, along with his later contributions to Colossus (used against the Lorenz cipher), helped establish the theoretical and practical underpinnings of electronic computation.',
          'The Enigma story also offers enduring lessons for information security. The machine\'s key space was enormous, yet it was broken because of a combination of mathematical structure (the reflector ensuring no letter encrypts to itself), procedural failures (predictable message keys, stereotyped messages), and the hubris of assuming the system was unbreakable. These lessons — that security depends on the entire system, not just one component, and that human factors are often the weakest link — remain as relevant in modern cybersecurity as they were in 1940.',
        ],
      },
    ],
  },
];
