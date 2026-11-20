"""The story, told like a visual novel between the levels.

Plain data again (no logic): each scene is a list of lines. A line says who
speaks ("hachi", "nana" or "narrator"), her mood ("idle", "happy" or "hurt" for Hachi;
"idle", "happy", "annoyed" or "angry" for Nana; it picks the matching
picture) and the words. The browser plays them
one at a time in a dialogue box.

Scene keys:  intro (before level 1), after_1 .. after_3 (between levels),
             ending (after level 4).
"backdrop" is the level whose scenery is painted behind the scene (the one
that comes next). "bags" gives Nana her shopping bags.
"""


def line(who, mood, text, **extra):
    """One line of dialogue. Pass card=True to show it alone on a full-screen
    "title card" (like "Later that day...") instead of in the dialogue box."""
    return {"who": who, "mood": mood, "text": text, **extra}


H, N = "hachi", "nana"

SCENES = {
    # ---- Before level 1: the snowy station ------------------------------------
    "intro": {
        "backdrop": 1,
        "bags": False,
        "lines": [
            line(H, "happy", "Hi, I'm Hachi! Well, Nana Komatsu really, but everyone calls me Hachi."),
            line(H, "idle", "I grew up in a tiny snowy town. It's cozy, but my dreams are way bigger than this little station."),
            line(H, "happy", "So I'm going to Tokyo for a fresh start! New friends, a new job, and maybe even a sweet little place of my own!"),
            line(H, "hurt", "...Okay, I'm a tiny bit scared too. But my train leaves soon, and I can't be late!"),
            line(H, "happy", "Help me grab my tickets and bentos, dodge the grumpy pigeons, and hop on the Shinkansen!"),
        ],
    },
    # ---- Before level 2: on the train, then the apartment ---------------------
    "after_1": {
        "backdrop": 2,
        "bags": False,
        "lines": [
            line(H, "happy", "Whew, I made the train! And someone just sat down right next to me..."),
            line(N, "angry", "Hey. You're standing on my boot."),
            line(H, "hurt", "Eek! Sorry, sorry! I'm Nana! Nana Komatsu! Nice to meet you!"),
            line(N, "happy", "...Funny. I'm Nana too. Nana Osaki. I'm heading to Tokyo to make it as a singer."),
            line(H, "happy", "Two Nanas on one train?! That's got to be fate!"),
            line(H, "idle", "We chatted all the way to Tokyo. Then we said goodbye at the station and went our own ways."),
            line("narrator", "idle", "Later that day...", card=True),
            line(H, "hurt", "I went to see a cheap apartment, Room 707... and guess who was already standing there?"),
            line(N, "annoyed", "...You."),
            line(H, "happy", "Nana?! You're looking at this place too?"),
            line(N, "idle", "Yeah. I love it, but the rent is way too high for one person."),
            line(H, "hurt", "Same here! I can't afford it by myself either..."),
            line(N, "happy", "Then let's split it. ...Just don't touch my records."),
            line(H, "happy", "Really?! Deal! Now I just have to get the key and climb up to Room 707!"),
        ],
    },
    # ---- Before level 3: an empty apartment, off to Harajuku ------------------
    "after_2": {
        "backdrop": 3,
        "bags": False,
        "lines": [
            line(H, "happy", "We're in! Room 707 is tiny and a little crooked, and I love it already."),
            line(H, "hurt", "But... it's totally empty. No curtains, no cushions, not even a kettle!"),
            line(N, "idle", "I have my guitar and my amp. That's about it."),
            line(H, "happy", "Then let's go shopping in Harajuku! Everything there is so cute!"),
            line(N, "idle", "You pick what we need. I'll wait for you at the end of the street. Try not to get lost."),
            line(H, "happy", "I won't! Probably. Watch out for crowds and cars, and I'll find 10 treasures!"),
        ],
    },
    # ---- Before level 4: the housewarming party -------------------------------
    "after_3": {
        "backdrop": 4,
        "bags": True,
        "lines": [
            line(H, "happy", "We bought sooo much! Cushions, cups, fairy lights and a pink kettle with a face!"),
            line(N, "annoyed", "A kettle with a face. Of course."),
            line(H, "happy", "Let's throw a housewarming party tonight! Everyone is coming at eight!"),
            line(N, "annoyed", "Eight? It's almost eight."),
            line(H, "hurt", "EEEK! The guests will be here any second! Help me set up before the doorbell rings!"),
        ],
    },
    # ---- After level 4: home ---------------------------------------------------
    "ending": {
        "backdrop": 4,
        "bags": True,
        "lines": [
            line(H, "happy", "We did it! Room 707 is sparkling, and the party is ready!"),
            line(N, "idle", "Not bad, Nana. This place actually feels like home."),
            line(H, "happy", "Because we're together! I came to Tokyo to follow my dreams, and I found my best friend first."),
            line(N, "happy", "Don't get sappy. ...Me too, though."),
            line(H, "happy", "Thank you for hopping along with me! Welcome home, everybody!"),
        ],
    },
}

# One cheerful line shown under "Level Complete!" after each level.
CHEERS = {
    1: "Train caught! Tokyo, here we come!",
    2: "Room 707 found! Home sweet home!",
    3: "Shopping spree complete!",
    4: "The party is ready!",
}

STORY = {"scenes": SCENES, "cheers": CHEERS}
