<script lang="ts">
	export let storyTitle: string;
	export let storyContent: string = '';

	// Mock story content - in a real app, this would come from your CMS/database
	const mockContent = {
		'noah-rainbow-promise': `
			Chapter 1: The Great Flood

			In the days when the earth was young and filled with wickedness, there lived a man named Noah. He was a righteous man, blameless among the people of his time, and he walked faithfully with God.

			God saw how great the wickedness of the human race had become on the earth, and that every inclination of the thoughts of the human heart was only evil all the time. The Lord regretted that he had made human beings on the earth, and his heart was deeply troubled.

			So the Lord said, "I will wipe from the face of the earth the human race I have created—and with them the animals, the birds and the creatures that move along the ground—for I regret that I have made them."

			But Noah found favor in the eyes of the Lord.

			God said to Noah, "I am going to put an end to all people, for the earth is filled with violence because of them. I am surely going to destroy both them and the earth. So make yourself an ark of cypress wood; make rooms in it and coat it with pitch inside and out."

			And Noah did everything just as God commanded him.

			Chapter 2: The Promise

			After the floodwaters had receded and the ark came to rest on the mountains of Ararat, Noah and his family emerged from the ark. Noah built an altar to the Lord and sacrificed burnt offerings on it.

			The Lord smelled the pleasing aroma and said in his heart: "Never again will I curse the ground because of humans, even though every inclination of the human heart is evil from childhood. And never again will I destroy all living creatures, as I have done."

			"While the earth remains, seedtime and harvest, cold and heat, summer and winter, day and night, shall not cease."

			Then God said to Noah and to his sons with him: "Behold, I establish my covenant with you and your offspring after you, and with every living creature that is with you, the birds, the livestock, and every beast of the earth with you, as many as came out of the ark; it is for every beast of the earth."

			"I establish my covenant with you, that never again shall all flesh be cut off by the waters of the flood, and never again shall there be a flood to destroy the earth."

			And God said, "This is the sign of the covenant that I make between me and you and every living creature that is with you, for all future generations: I have set my bow in the cloud, and it shall be a sign of the covenant between me and the earth."

			"When I bring clouds over the earth and the bow is seen in the clouds, I will remember my covenant that is between me and you and every living creature of all flesh. And the waters shall never again become a flood to destroy all flesh."

			"The bow shall be in the clouds, and I will see it and remember the everlasting covenant between God and every living creature of all flesh that is on the earth."

			God said to Noah, "This is the sign of the covenant that I have established between me and all flesh that is on the earth."

			The rainbow in the sky became a symbol of God's promise—a promise of grace, mercy, and hope for all generations to come.
		`,
		'david-giant-shadow': `
			Chapter 1: The Valley of Elah

			In the valley of Elah, where the armies of Israel and the Philistines faced each other, a giant named Goliath emerged from the Philistine camp. He was over nine feet tall and wore a bronze helmet and coat of mail that weighed 125 pounds.

			For forty days, morning and evening, Goliath stood and shouted to the ranks of Israel: "Choose a man and have him come down to me. If he is able to fight and kill me, we will become your subjects; but if I overcome him and kill him, you will become our subjects and serve us."

			When Saul and all the Israelites heard this, they were dismayed and terrified.

			Chapter 2: The Shepherd's Courage

			David, the youngest son of Jesse, had been sent by his father to bring food to his brothers who were serving in Saul's army. When he arrived at the camp, he heard Goliath's challenge.

			"Who is this uncircumcised Philistine that he should defy the armies of the living God?" David asked.

			His brothers were angry with him, but David persisted. "Let no one lose heart on account of this Philistine; your servant will go and fight him."

			Chapter 3: The Stone and the Sling

			Saul tried to give David his armor, but David was not used to wearing such heavy gear. Instead, he took his staff in his hand, chose five smooth stones from the stream, put them in the pouch of his shepherd's bag, and approached Goliath.

			The Philistine looked David over and saw that he was little more than a boy, glowing with health and handsome, and he despised him.

			"You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty," David said. "This day the Lord will deliver you into my hands, and I'll strike you down and cut off your head."

			As Goliath moved closer to attack him, David ran quickly toward the battle line to meet him. Reaching into his bag and taking out a stone, he slung it and struck the Philistine on the forehead. The stone sank into his forehead, and he fell facedown on the ground.

			So David triumphed over the Philistine with a sling and a stone; without a sword in his hand he struck down the Philistine and killed him.
		`
	};

	// Get content based on story title or use provided content
	$: displayContent =
		storyContent ||
		mockContent[storyTitle as keyof typeof mockContent] ||
		'Story content not available.';
</script>

<div class="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
	<div class="prose max-w-none prose-invert">
		<h2 class="mb-6 text-2xl font-semibold text-slate-100">{storyTitle}</h2>

		<div class="space-y-4 leading-relaxed text-slate-300">
			{#each displayContent.split('\n\n') as paragraph}
				{#if paragraph.trim()}
					{#if paragraph.startsWith('Chapter')}
						<h3 class="mt-8 mb-4 text-xl font-semibold text-amber-300">{paragraph}</h3>
					{:else}
						<p class="leading-relaxed text-slate-300">{paragraph.trim()}</p>
					{/if}
				{/if}
			{/each}
		</div>

		<!-- Reading progress indicator -->
		<div class="mt-8 border-t border-white/10 pt-6">
			<div class="flex items-center justify-between text-sm text-slate-400">
				<span>Reading Mode</span>
				<span>Scroll to continue...</span>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.prose) {
		--tw-prose-body: rgb(203 213 225);
		--tw-prose-headings: rgb(241 245 249);
		--tw-prose-links: rgb(251 191 36);
		--tw-prose-bold: rgb(241 245 249);
		--tw-prose-counters: rgb(156 163 175);
		--tw-prose-bullets: rgb(75 85 99);
		--tw-prose-hr: rgb(55 65 81);
		--tw-prose-quotes: rgb(241 245 249);
		--tw-prose-quote-borders: rgb(55 65 81);
		--tw-prose-captions: rgb(156 163 175);
		--tw-prose-code: rgb(241 245 249);
		--tw-prose-pre-code: rgb(209 213 219);
		--tw-prose-pre-bg: rgb(17 24 39);
		--tw-prose-th-borders: rgb(55 65 81);
		--tw-prose-td-borders: rgb(55 65 81);
	}
</style>
