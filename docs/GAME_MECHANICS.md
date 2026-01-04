# Mimbru Game Mechanics

## The Pet

Your pet has 4 stats (0-100):

| Stat | What it does | How it drops | How to raise |
|------|--------------|--------------|--------------|
| **Health** | Pet passes out at 0 | Neglect, no habits | Complete habits, petting |
| **Happiness** | Affects animations | Low stats, neglect | Habits, feeding, petting, cleaning |
| **Cleanliness** | Drops when pet poops | Daily poop, time | Clean action |
| **Hunger** | General wellbeing | Time since feeding | Feed action (costs food) |

## Actions

### Feed (costs 1 food)
- +20 hunger, +10 happiness
- If pet is passed out: revives with 30 health

### Clean
- +30 cleanliness, +15 happiness
- Clears all poop
- Bonus if poop exists: +20 cleanliness, +10 happiness

### Pet (5 min cooldown)
- +15 happiness, +5 health

## Food Economy

You start with 10 food. Earn more by completing habits:

| Streak | Food earned |
|--------|-------------|
| 1-2 days | +1 |
| 3-6 days | +2 |
| 7+ days | +3 |

## Habit Completion Effects

When you complete a habit:
- +10 happiness (base) + streak bonus (up to +10)
- +5 health (base) + streak bonus
- Stats get boosted to minimums: Health 60, Happiness 70, Hunger 50
- If pet was passed out: revives with 20+ health

## Automatic Events

| Event | Frequency | What happens |
|-------|-----------|--------------|
| Poop | Every 24h | +1 poop, -15 cleanliness |
| Health decay | Every 12h | -20 health, -15 happiness (if no habits done) |
| Degradation | Every 1h | Stats drop based on habit completion rate |

## Death & Revival

Pet passes out when health hits 0. To revive:
- Feed it (costs 1 food, gives 30 health)
- Complete any habit (gives 20+ health)

## Warnings

Visual warnings appear when:
- Health < 20 (critical)
- Happiness < 20 (very sad)
- Cleanliness < 20 (filthy)
- Hunger < 20 (starving)
- Poop count >= 3 (dirty)
- Poop count >= 5 (toxic - increased decay)

## Animation States

| State | When |
|-------|------|
| idle | Default, standing still |
| walking_up/down/left/right | Moving around |
| happy | Happiness > 80 |
| sad | Health < 30 or Happiness < 30 |
| eating | Hunger < 20 |
| sleeping | Sleeping state |
| dead | Passed out (health = 0) |
