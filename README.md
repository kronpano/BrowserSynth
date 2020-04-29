# BrowserSynth
A browser implementation of StructureSynth with more primitives, non-uniform scaling of all primitives and object export for external rendering

Head over to https://kronpano.github.io/BrowserSynth/ to try the live version

For more information on the eisenscript language check out http://structuresynth.sourceforge.net/reference.php

Most transformation commands are implemented - except mirroring which can be achieved using the matrix operator
There are differences between the behaviour of the original Structure Synth and BrowserSynth.
BrowserSynth does not do shearing of objects but it offeres non-uniform scaling of spheres, cylinders.....

Click on the three lines to go to the menu - you can find quite a few example scripts.
The 'level of detail' is only in effect for round objects - it determines the number of triangles used when rendering and exporting. 

More information will be added - this is just the initial upload

Here are a couple of links which will open the script here on github in BrowserSynth
[satellite script](https://kronpano.github.io/BrowserSynth/#B/lZHRcoIwEEWfzVfcZ2dwkgA2fE6AqLQozgZHkcm/dwOofWin7QMksHvv2dx41+Nob7U79wfkUvj5uyvfXdV7aCOlFMJgjZFuyPJAVgi6tA5kMQqs0ljCDYne5OAWLeEhN0WKgLHq2o5Qtrb64BaDARp0h1qaDBS/dQBlYKtxQGJinTGgnQgP0m4UKz1xZsO22R/6sr04NsyiIMmYPUAZyUL9EmoWKqxH7kgDs+NOM1pB8bRqkhYSgVIGmHjGO7bz/Fv2TnjlUVREx595LDAx9j8ZGTMWqcpnbfFXbcraqbrl5y2uoaLO+x3ZowPXOFCebz719dD0LlAZ5Yu+xLFmBN/DEnVH9rR3KKdwve0n6xkQozahqTpvOewR9xg9HqNxGhu+Mqpfw9W4TgVG5F8Q0xgxuUKGszv1P7np/5pVQ9ucakfR73e7p9F36OUgnw==)
after object/mtl export and an external render it looks like that
![satellite](https://scontent.flhr2-2.fna.fbcdn.net/v/t1.0-9/95244997_10218938450906182_4682721788205989888_o.jpg?_nc_cat=111&_nc_sid=ca434c&_nc_ohc=mIQMc2jgMUEAX-_DSoW&_nc_ht=scontent.flhr2-2.fna&oh=3a29e771fb8ac955c6f75694123c7e05&oe=5ED06BA3)
[spikey script](https://kronpano.github.io/BrowserSynth/#B/hZBBb4QgEIXP5Ve8cxMNqDTspf8FFNdt3dogm7oa/ntnZFt76wEmDPO99zKzj7japfOfcYCWYs7vyb35Ns6ojJRSCINnbGFBo1OwQoTb6BEsrh0UXhF6bOJpa6dxCnCjbd+RECpq3VEYhJU5mhfpB+03UbEkMjNezkN0480DdzQMFI0G+Skjd6VfsCInxSSN1AlZZKU6UxJVarqZPkmkUIvKcOwVpuQBWZ406Rd7TdhluKv5h2yZIKOHU01O9K0IVSVrq9QHe/Vi42BkkKN/DZfoU3DiyOjyXo6VTMF+nD0c+RjMNlJ9SW5aaICyy0c4vR9V1hSkO9Q6VtN/1LLjv/g3)
will result in a structure like this 
![spikey](https://scontent.flhr2-2.fna.fbcdn.net/v/t1.0-9/94705905_10218929778329373_2963783461535481856_o.jpg?_nc_cat=104&_nc_sid=ca434c&_nc_ohc=AqLbXkY__PIAX9QjrEp&_nc_ht=scontent.flhr2-2.fna&oh=f94502fb10f8a70a36a55115b59d7f8d&oe=5ECF9F4C)
[balconies](https://kronpano.github.io/BrowserSynth/?#B/fZLRjtowEEWfN19xpT6sVIngJGQhr/2C1fYLTDCQ1sTIdrSEyP/eGTuEaqUWiSCcmTP33rFTHhd5M/tfqvUOtRAiy6YRhYAdUQm0RhuLb1VVwaFAkZcowl7q1vRjlmV20ArzX2RT9rLBd0zU2gjcgaIMeOOTEauSiZuaMQzhZ0DJL+8o6YSGwt5R7Gj0DasIKPIaAZEJJCrCjzTuo+tP79J6ZGHW8eUFy5kIu2LKjAywxhyRPus1Pjt/hj9Lj9EMOFEaMlU4b4fWD1YxQ0Lkmyin2bDOXJCLKn8jxSIX9RzSXg8qYG9uDH49aencK66yV5oZ3NBQORvfEYR5Iq+ruVl3p7M/WTUGBjDhqA2d+04rxw6TRdbGvmJuRCjJ0TuP+DnsecodvCfizpO2nN/Ryotary/d4UAImjdc+pcMeJZXyUesT3qiFDazZNgs1aJ+lDcl8SfKthEBV9V7ScrN4LqDghuuV0PruXZaS+uQxi+4HY26If0+wGX8ztgkG/8Gtsb2yrr/EottPT8TlTe5fV5qkSwu8S5RTmllZZIUGU9JS5Txpvhz1/5WljZNV27WktzMgVK8f23h0dP3X3qivjhyF5cXAQFndZNZ+AM=)
can look like
![balconies](https://scontent.flhr2-2.fna.fbcdn.net/v/t1.0-9/92614016_10218759609515259_6655596392645394432_o.jpg?_nc_cat=104&_nc_sid=07e735&_nc_ohc=1cwQPOrO_EwAX_gUAex&_nc_ht=scontent.flhr2-2.fna&oh=b0f04940edbad57efa8f109c5a6793af&oe=5ECEF330)
A script for an [antenna array](https://kronpano.github.io/BrowserSynth/?#B/hZHNboMwEITvfoqRequUyDZxYi59F342IlVSIpuq/Mjv3mVJSrm0QiC8M/5m7Y3U4Vb0bflOVRdxsPao4lKr6d41cNZLIRLVvFAqFGpCD2MxYMffMMJ4jQQRRqmJHIZVUOHzSvyDSR3wiqlqr23Ay9mu3lysZqN779eUXLNuN7pz7pEYeuzEkKn0TDOcVoU2xnMobqQOft45R2WI0Pv8yNl675AmoUvxlKrhevmoKfBhFiiWsK/m0lEK5cq3zJ/YY3TaJoxrAncvEYvhX2TGyC2L/T+w8QGbQx/9+nRuqC/+Ij/ZJW48QbwhVHPjvTRpYfhJv65pnqHeW6E7eQ2vGp6S3rTKEEwRxoGHbGTTyaV4byhQ+gY=)
could end up looking like
![antennas](https://scontent.flhr2-1.fna.fbcdn.net/v/t1.0-9/92039395_10218707942823624_2090802535097958400_o.jpg?_nc_cat=105&_nc_sid=8024bb&_nc_ohc=JiSaiIHurIAAX9jRA5-&_nc_ht=scontent.flhr2-1.fna&oh=cf0e068adea65ef4dd7c63ad55a6ff05&oe=5ED092B1)
and a [marble run](https://kronpano.github.io/BrowserSynth/#B/hVNBboMwEDzXr5gPQMAVinOpVKlf6ANocEurgJExDYnF37u2gUIVUpCQmZ0Zze5CKw2qvFdvX/JoWvCMC9YGrJCNKcH33AOtlAXSLGOsNbk2zPbgHCWEGALAdHeS8GdbqW85jIg744wU1pZIB9Pp+pAMd2rKlFKvCXwktEbnnx+lWVZDBV1zAyzUub7tRPznunjZrjspMV6bqY9ZgKog2pNnWLDJbjxMEcFG49lo0nWNxTJeoIXeAcserL4iohnhqHQtNQEXRBwBRUvjojtOyMCFZmsHP73ZJhUJSJyuvB7RkwNV77nNfZwhnNv7KTekpq2PmiQ+iC3NQnAhYoYrPQWckl6O6qQ0dF4XqhrahvLK/5y7xll2jZuY6+ziR0GSOHXmURKn+wx/RI4cBtEvBrE0CR4+3Vq/20WbVzB37dm5v9+9665epPbfyMwKC3ERlqywGcswLax3cTAE3DFhHXTIaD5JnAg/JPozBx8i6Hwn0TZp+AE=) can look like this ![this](https://scontent.flhr2-2.fna.fbcdn.net/v/t1.0-9/91742386_10218640889067322_7809891393433763840_o.jpg?_nc_cat=110&_nc_sid=07e735&_nc_ohc=zBoWG-e1iioAX8AnLd0&_nc_ht=scontent.flhr2-2.fna&oh=9ec34c11489a5695b10f4af2f57f1c30&oe=5ECDC547)
