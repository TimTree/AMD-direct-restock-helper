<p>This project is discontinued (again), and this time for good. AMD Direct's been working <i>hard</i> to break the restock helper, and I've reached my breaking point.</p>
<p>For context, here's what AMD's done to their store since development began:</p>
<ul>
<li>2021/03/24: AMD broke directly accessing their "add to cart" API, meaning all stock checks must occur with the AMD storefront loaded (referrer AMD.com).</li>
<li>2021/03/30: AMD locked "add to cart" behind a CAPTCHA, meaning the restock helper had to switch to an alternate web-scraping method to check for stock. It was then I announced the first project discontinuation.<br/>For some reason, the CAPTCHA was removed for the April 1 and 8 restocks, allowing a few users to successfully buy their graphics card. Seeing these successes motivated me to resume development, but little did I know what AMD was up to next.</li>
<li>2021/04/14: The "add to cart" CAPTCHA returned, but this time the CAPTCHA randomly doesn't work even when not using the helper. This meant the helper can no longer automate initiating checkout since there's no guarantee that a valid CAPTCHA actually works.</li>
<li>2021/04/15: AMD Direct did not restock even though it's a Thursday. This starts a potential cycle of random drops, piling on additional stress.</li>
<li>2021/04/16: AMD found a loophole in the restock helper, dishing out error 403's when checking for stock. This is because the "add to cart" API now requires specific cookies in the request header, which the restock helper would clear to circumvent a ban for refreshing too much on the same set of cookies. It took a while, but I identified the required cookies and kept (or spoofed) them, which worked for a few days.</li>
<li>2021/04/20: AMD implemented the Akamai Bot Manager to the store, specifically designed to break tools like this restock helper. Unfortunately for us, the Bot Manager works well. It can somehow distinguish manual refreshes from automated ones, making it difficult to resanitize cookies from the aformentioned cookie ban. Worse, AMD now imposes IP bans only for the "add to cart" API and not the storefront, meaning we can no longer distinguish cookie bans from IP bans.
</ul>
<p>As a result, I've spent way more time combatting AMD site changes than adding new features. I'm sorry, but it's just not worth the time and effort to keep the project going, especially with all the forces going against it.</p>
<p>If you'd like to continue the work done on this project, feel free to fork/clone this repo. I am more than happy to answer any clarifying questions via the contact methods below.</p>
<p>I continue to wish all of you the best getting that new graphics card. May more cards arrive to the hands of those who will actually use it.</p>

<p>~ TimTree</p>