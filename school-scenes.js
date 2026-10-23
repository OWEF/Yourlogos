// YourLogos visual encounter scenes: interpretations rather than right/wrong quizzes.
// Each choice updates the conceptual tension diagram; nothing is graded.
export const SCHOOL_SCENES={
  "stoicism": {
    "tag": "CONTROL / RESPONSE",
    "pole": [
      "Circumstance",
      "Response"
    ],
    "scenes": [
      {
        "place": "A delayed train",
        "question": "You will miss something important. What do you do first?",
        "options": [
          [
            "Blame the delay",
            "The event becomes the center of your attention.",
            16
          ],
          [
            "Find your next action",
            "You distinguish what happened from what remains yours to decide.",
            84
          ],
          [
            "Pretend it does not matter",
            "Calmness can also hide what genuinely matters to you.",
            50
          ]
        ],
        "insight": "The Stoic move is not passive acceptance. It is acting well inside a situation you did not choose."
      },
      {
        "place": "An unfair comment",
        "question": "Someone criticizes you in public. Where does your freedom begin?",
        "options": [
          [
            "Win the argument",
            "You try to control how others see you.",
            21
          ],
          [
            "Examine the judgment",
            "You make room between the remark and your response.",
            88
          ],
          [
            "Suppress the feeling",
            "Stoicism makes space for judgment, not the denial of emotion.",
            53
          ]
        ],
        "insight": "For Epictetus, the first impression arrives uninvited; how you assent to it matters."
      }
    ]
  },
  "existentialism": {
    "tag": "CHOICE / AUTHENTICITY",
    "pole": [
      "Inherited path",
      "Chosen path"
    ],
    "scenes": [
      {
        "place": "The safe career",
        "question": "Your family expects a stable career. You want something else. What happens?",
        "options": [
          [
            "Follow the script",
            "The decision still involves you, even when expectations are strong.",
            20
          ],
          [
            "Own the uncertain choice",
            "Freedom arrives with responsibility, not certainty.",
            83
          ],
          [
            "Wait for a sign",
            "Not choosing is also a choice with consequences.",
            48
          ]
        ],
        "insight": "Existentialism asks you to notice that you participate in making the life you live."
      },
      {
        "place": "A blank calendar",
        "question": "With no obligations today, what makes the day yours?",
        "options": [
          [
            "Let others decide",
            "You borrow a ready-made meaning.",
            22
          ],
          [
            "Choose and commit",
            "A direction becomes real through action.",
            87
          ],
          [
            "Avoid deciding",
            "Possibility can feel heavy enough to postpone.",
            47
          ]
        ],
        "insight": "The anxiety of freedom is not a design flaw; it belongs to having possibilities."
      }
    ]
  },
  "nihilism": {
    "tag": "LOSS / CREATION",
    "pole": [
      "Old certainty",
      "New meaning"
    ],
    "scenes": [
      {
        "place": "An old belief falls apart",
        "question": "Something that once gave you purpose no longer convinces you.",
        "options": [
          [
            "Replace it instantly",
            "A new certainty can conceal the original question.",
            27
          ],
          [
            "Stay with the question",
            "You allow the loss to be real before creating a response.",
            55
          ],
          [
            "Make a value deliberately",
            "You explore what could be affirmed without inherited guarantees.",
            85
          ]
        ],
        "insight": "Nihilism diagnoses the collapse of meaning; Nietzsche also asks what can follow it."
      },
      {
        "place": "No universal scoreboard",
        "question": "Imagine there is no cosmic list of what makes a life successful.",
        "options": [
          [
            "Everything is pointless",
            "That is one response, not the only possible conclusion.",
            15
          ],
          [
            "Question the metric",
            "You investigate who gave success its authority.",
            65
          ],
          [
            "Experiment with values",
            "Meaning becomes a difficult creative task.",
            90
          ]
        ],
        "insight": "Losing one source of value need not mean all valuation becomes impossible."
      }
    ]
  },
  "skepticism": {
    "tag": "CERTAINTY / INQUIRY",
    "pole": [
      "Quick certainty",
      "Open inquiry"
    ],
    "scenes": [
      {
        "place": "A confident headline",
        "question": "Everyone shares a startling claim. How do you approach it?",
        "options": [
          [
            "Believe it at once",
            "Confidence is not the same as evidence.",
            13
          ],
          [
            "Reject it at once",
            "Skepticism need not mean reflexive disbelief.",
            34
          ],
          [
            "Examine the grounds",
            "You suspend judgment while the evidence remains incomplete.",
            90
          ]
        ],
        "insight": "A skeptic can remain curious without needing an instant answer."
      },
      {
        "place": "A disagreement",
        "question": "Two careful people reach opposite conclusions.",
        "options": [
          [
            "Pick the loudest",
            "Social certainty may masquerade as proof.",
            20
          ],
          [
            "Ask what differs",
            "The premises can matter more than the conclusion.",
            84
          ],
          [
            "Give up on knowing",
            "Uncertainty can invite inquiry rather than resignation.",
            43
          ]
        ],
        "insight": "Suspending judgment is an active discipline, not intellectual laziness."
      }
    ]
  },
  "daoism": {
    "tag": "FORCE / FLOW",
    "pole": [
      "Forcing",
      "Attunement"
    ],
    "scenes": [
      {
        "place": "A difficult conversation",
        "question": "The more you argue, the less the other person hears you.",
        "options": [
          [
            "Push harder",
            "Force can create resistance even with good intentions.",
            15
          ],
          [
            "Pause and listen",
            "You change the conditions before trying to change the outcome.",
            87
          ],
          [
            "Say nothing forever",
            "Wu wei is not identical to doing nothing.",
            49
          ]
        ],
        "insight": "Daoist non-forcing means acting in tune with conditions rather than against their grain."
      },
      {
        "place": "A garden after rain",
        "question": "Some plants grow and others fail, despite your plans.",
        "options": [
          [
            "Control every detail",
            "A plan can become a struggle against changing conditions.",
            19
          ],
          [
            "Attend and adjust",
            "Care is responsive rather than rigid.",
            91
          ],
          [
            "Abandon the garden",
            "Flow does not mean withdrawing from every commitment.",
            47
          ]
        ],
        "insight": "Flexibility works with the world instead of demanding it stay still."
      }
    ]
  },
  "buddhism": {
    "tag": "CLINGING / AWARENESS",
    "pole": [
      "Grasping",
      "Awareness"
    ],
    "scenes": [
      {
        "place": "A beautiful moment ends",
        "question": "A conversation makes you happy. It is time to leave.",
        "options": [
          [
            "Try to hold it still",
            "Clinging asks a changing moment to stop changing.",
            19
          ],
          [
            "Notice your attachment",
            "Awareness makes space for appreciation without possession.",
            88
          ],
          [
            "Refuse to enjoy it",
            "Impermanence need not erase joy.",
            44
          ]
        ],
        "insight": "Seeing impermanence can deepen attention rather than make life empty."
      },
      {
        "place": "An unpleasant feeling",
        "question": "A familiar worry returns while you are trying to rest.",
        "options": [
          [
            "Fight the feeling",
            "Resistance can become an additional layer of suffering.",
            24
          ],
          [
            "Observe it changing",
            "You discover that an experience is not a fixed identity.",
            88
          ],
          [
            "Call yourself weak",
            "Self-judgment can tighten the knot.",
            43
          ]
        ],
        "insight": "Mindfulness is not a command to feel calm; it is a different relationship to experience."
      }
    ]
  },
"confucianism":{"tag":"RITUAL / CARE","pole":["Outer form","Humaneness"],"scenes":[{"place":"A family disagreement","question":"Someone you respect is unfair. How do you respond?","options":[["Keep quiet","Respect without honesty may protect a problem.",19],["Speak with care","A relationship can hold both respect and correction.",82],["Win the argument","Being right is not the only concern.",43]],"insight":"Confucian ethics asks how sincerity and practiced conduct build relationships."}]},
"epicureanism":{"tag":"DESIRE / ENOUGH","pole":["More","Enough"],"scenes":[{"place":"A new purchase","question":"You want something expensive. What matters most?","options":[["Buy immediately","An impulse can promise more than it delivers.",20],["Ask what you need","Contentment may depend on fewer wants.",84],["Reject every pleasure","A simple life need not reject delight.",45]],"insight":"Epicurean pleasure involves durable tranquility, not endless indulgence."}]},
"idealism":{"tag":"SELF / RECOGNITION","pole":["Isolated self","Recognized self"],"scenes":[{"place":"A misunderstood intention","question":"You think you know yourself, but your friend sees you differently.","options":[["Ignore their view","Self-certainty can close off understanding.",18],["Consider the relation","Identity can become clearer in recognition.",85],["Accept their judgment","Recognition is not passive conformity.",48]],"insight":"German Idealism investigates self-consciousness through relation and reason."}]},
"pragmatism":{"tag":"THEORY / PRACTICE","pole":["Abstract belief","Tested idea"],"scenes":[{"place":"A new idea","question":"Two explanations sound convincing. What comes next?","options":[["Choose the elegant one","An elegant explanation may still fail.",20],["Test consequences","Inquiry becomes richer through experience.",85],["Stop asking","Uncertainty need not end curiosity.",47]],"insight":"Pragmatism treats concepts as answerable to inquiry and their practical bearings."}]}
};
