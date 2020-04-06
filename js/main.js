window.URL = window.URL || window.webkitURL;

function decode( string ) {
  return RawDeflate.inflate( window.atob( string ) );
}

function encode( string ) {
  return window.btoa( RawDeflate.deflate( string ) );
}


// this here contains the encoded render,html - that means run it through RawDeflate.deflate( string )
// in practicse
// copy the render.html code and paste it into the text field in convert_render4main.html -> output happens to console/text field -> copy the encoded string and paste it here
//
// this will then replace the "container" div defined in index.html
var container = decode(
  'lVdbb9s2FH7XrzhxO1hGFclp13WQ4wCd6zQt2qaIMxR7KmjxSGYiiRpJJ/aK/PcdUpItd+2qIg8yz+U7F54Lc3r06nJ2/dfHOVxcv3935p2uTJFDzspsOsByYAnIOH0KNAySFVMazXTw5/X58e+Wa4TJ8UxhyVGhOo3qs3eqzTZHMNsKpwODGxMlWpP8UvItfPEAUlma45QVIt/G8F6WUlcswQlxliy5zZRcl/w4kblUMTx6OrZ/llkwlYkyhnG1sUd5hyrN5X0MK8E5lhPvwTuNnG3yIRflLSjMpwNH0StEM4CVwnQ6IHdqOR3Wnp1GTaDWRRtAokRluhGg0FjW5AEITvnpErRKpgPC+UV71gVH3cM4bhSxG7YJMymzHFklyLQsHC3KxVJHN3+vUW2jZ+E4HDeHsBBleEP+fQey/q0jQ1GhEz45ed5H4friaj7fhJ9EyeX9FWrxD/ZRu1RLYWZ0d0rmuo9CorNe7lj/Z4vXfWT/oGJ7L7lIBao+8towo38qkZuwLehat4feHSlIFbmK/Qn5wvQRPhc5LhjVet8oLv94O99UUpl+GXr97vr8Z+Q7hf+VuPetxrlhd6xpkzPvjilIqICYKFEF0CY6ALm8wcToAEqYwjiAqv4oLMp10fyW5rMsP8s0DYBthN4dMiV4c5h4nkj9XCYsXxipWIZhhuaNwcIf6pW8f0l6w9HIDaEOBhl4u7j8EFZ2wPVQt5Pmu3a4vJJUONjagY7nfQx19MkOgOel6zIxQpbASlEQx6+BFdKU0OalIxL7XLEC/VYISNsJ1SkObbgXmFeo/E7ko0lXJml7m61N4wV5vHf/28LrijunDrj1D0t8oLp47LcxON9JMIqoEIpK0JjOwjAkiq0NTeaelHgPr3aIdclYSVTEtcz5m8X8QzhriHuxuogSyd0qMWrb5L+mz4hOAC1W2PzwH/vDR52aHo5CW7f+yMGCLVctcwxzmfl7IMd8gISZZAU+tjfdCqNSUvk0k1FrutwGSqFZq9Jp2hR0kYeNN2BEgfEwAL+TBjgGPYInMCyo+iZN9uoE/yh7Ns0K7T2aFe5up3NRBym9pnK6ahj+vdsOoSipVT8JblYBdEkXKLKVad3JkEjWDAN9u13KTW3bGq3PwDjXxM2lAZlCSvuejiUHGmxG0OHo6OigXDlfOEX/i5FVPN68wGSMGCylMbKgM/8tef4iDXSVCxOfhM8falf+t/1f06TYt2VnbvQdAA1AfZ1kqgMxqkE7IVhm03FfZBkbtcbArtr413GgDVb0fWigHjDX+COAlJHQTsPV3w+ad1EhcortWXNLbqEBF5Q0tv1vt352fN86etjMaaUb3ng0IZxxDEQK4CSGgj5P6bMM4NmTGJK1puux1va9EjbDPUylmrNktZ8FNaO9D30vXDfV1NDukJZFzcI0wnD/PBzGncjpQaVmdvm2um4Tk6tLqv3byQFEpUQhjLjDLgJV28eW3np1oO3S7ZLydePWGP37llUVaVDfgpFgn5t1/+62Il0Xl8m6wJLCcK07z9GeaDOIu6HzYSfg9GvE2Urk3N/BOLnd6UBmFzWXRYO9965eJu1U2S0cGuNWpvM0IGfcOzjJRXK7ZMo+BIhm39LNIzqy/02cef8C');


// all the example scripts  
var code_boxtorus = decode('dY3NDsIgEITvPMWcPTRsK9HXgRZ/Ikqy1YSW7LtbqBo9eNvJfPNtxghqDDiBSAuOfL4NnpXiR/DvhKwA2mODDJ7RakzQDeGEroN8mqk0c9UJkotJyctTQpXk8k2bwm4N+hgiwwXbX5bFge3VF8Yt8p3BaO/rUWH572u/RT8eEqyzJw==');

var code_spiral = decode('nY/BDoIwDIbvfYr/bAKs4jC8Bm8AugQNBjIwGRLe3YIuYOIB3aHb2n5ftyhC21xsXhG1psMtd2fTdCVi5e91cTWnrgUrWUQH7DDA9kgVJBnGKJEkIzKp2Xtl5ICBgKJ2Egc4qDBNpVU2WAc9sSzxgYDVAgMZ07jNwSuHFsVef1Hwh6IX9ugN02g9i2Z63M69sGDmgn/BeDPXT/9bnvue+zu/xpk9Tk8=');

var code_planes = decode('pZPBboMwDIbP8BQ+TyokIVD6OMAyiooAhVaDorz7HCdQWqnbYQeoiP/f/mK7cTy0RafGsGp01aow1LdWgftYwhw+YNEzyBTOIIQBbg8m4AL0HQ4pA0P2MPPCjD0LjzBD6rVeKr30ZKVSwqbNUMvZs9h4IPpaQoCl6tteQ63VbMr+c34clW1RXcyg+0G1rdIBep11PSH7CCzKAUskUYqlx+GstMIAMdC5BRDMQEKcd7wrI8QFEPogGFKyKAObKAEeHfFXGJcneMvb66Kr1UY8YkKsJdC9MkAcf+m+u75AZpsgwIhYmXLm22alkh4JE5AJeaS59vo2/tY+1Rn4Lw5FktS9bEPvpMR9+aN+2d72zWBonbDhWII/JriPHVzQzkaynWQtYHNt883o4Ql4CnfDSKSUIzq9uaRXvAigxLVam8QdpJ38TGRnHEUOBQ2gtG+zGau+ugyNz30kJOHM/s+0Kcumhu+mq51UUmIeORarTZKdFmk2sZ5wU2H0uZGfLLnb0G25TRCGPw==');

var code_beddard = decode('q1YoVrBQKKpUMDaoVUguSixJ5eIqKs1JhbAVclMUTKu5FBSqixUMa9OKEnOB0kAeUJOBnqlCBZC0VKgCk5UKuiAqQ8HICGYQskJdLCpNTBSwKYWo1EVRamaGx1BUpRYWMKW1XAA=');

var code_cubearc = decode('dVHLTsMwELz7K+YHmu4WGZIjjXoFKYgPKNTAIW2RoVJIlH9n7ThJkzq+eLUzO7MPeykN8tftTjUK8hpUWGn8QaN2AVrkRDRguMF4iq0C6DDmqeYEE81bx06UY4Y9FPPzkhy1CxCpVvkxodbrFPlz8bQrXpT148uADUJOXIYsN07NViBYkcvkqyVue6Z7A5s9W8icerr/5vSRTVP2gjYCn6nnL7NHdSa+Zkc7uWLPO48OOrJnnS9ouz0/FnlXJQGO++pgvn+/cEdSHy4llUnqb0UJabfq+0Q71U2S4kfA7EHjrTSnAz6tMSfJbNxFnbJT+LD7o5HTilnnH7rs4t7l/VyerchcDNq+cpIVXz+036yjIMKpkQ3r8TLtPw==');

var code_fancyarc = decode('jZPRTsMwDEWfyVfcZyS6uGthfUGCiVeQhviAwQJDKhvKhtha5d+x06SjaydopcWKT+6N7c5+lQbTp9s7VSvwU2OHixx75KgkgMNUa93m0MtRN3cRkpIj6mp2cqzZd2xEacgwpob8vCQN2oWUVk75MqFGowmmD7P7u9mjsr58LrBG2GOXdpdqUbM7aFiWK3ipOHaRlKelydMM08TjfjnGD7Tu0ie0EXjSkT9NH9RJ02968Ca/6OObDxZ6oI9ufkJb+nwzmzanOMDHfLcwn9slsgy4hlkt4hfHx5PCD0wnOpd+Xya5SKfJRMSz5AobYa5yPJd8EGs7X70Z3tITbOZbpE4svNyrnX+Yqqp43gPe43Fjjf96U897b8py/f2n92jUNCS0rYlrxb2TqWyQ8ZviZV2uLcr3t+X2ufwyDpvPpbEmXK7JSgIuenR2+bp+WP6LEAQDTIWiHauXiZ2J160V4Ry1tCJtOpHKX0gWKT3N+YfLp4QcPMm2hXZ42Zfvq4WxraCf6RkLhfOUR7mgQxwWcKFIIalP5hDDrIOlPJQeOOb3GMz6WMqvRBFz6gc=');

var code_s = decode('nY5dCsIwEISfm1PMBSLbLAF7jd7An76IpdBUTBtydzdBbaUqKHnamflm4poB7c53+1NzGBwsEangQBtGP0JXhN5DG4p1CXxwjOov5waSaI+wNqgiwMHI44h959M9yZXyFqmi2kaJq6JmFe+w+QrrFW0gjs/GhIU+NzKuIlIZFopscN5w4DTymFgVvfQ8qfwznrERmdI/Y/ovzr+duwE=');

var code_all = decode('XVRNb9swDL3nV7A9r03TuN123HroDgUGrBuGHRWZjt3JkkFRTdzC/32kbOdjgA/UM/n4KJFcLuE3OhtaBA7ANcJXCruI9Nx7rgHLhgPBK9xcrxbLpXzwJySwxsOOGkaIGhl7pmQ5kZoaZkOJQM22ZqhRUONLiIiZnzAmx1GpvnuL0AtfJ2CEy2+NhD1I7GVGNUuKY1Qb1Nok5uCjSm2Nb7rkDI//w+YFLSvpE1Y8OQIFFof4YdLShleMWcyuRnTwFkIbr6e6Hlxj/2auNbjGT46zDlsHyV9RaMFIealzkrMC3JtWzEwCPyU21oZmnYBeLyJmUpuI0DNES03H0Pjpun/9eMrp5CYPyV5SZOhCzPWoCnWcA6PEWpdKLGflz+YVJZfZiJDMIdRRsfO8Gq1kZdh5F0wJDaunBJBU1HaJkcBI2cC4Z6gah3OGLzw9Qpup5I3NHpAokLhLvcG7XkoXYhGXXV/Mq5kUW3mxoFzK9NiILkksSai/uFgs3nsoYDDOqXW1BtrD7Y3EOGm7jUt4+PUZ3sRT/18Vd5NDIOO3o8uCkjyJWO8LkDydCDVbybwACV6DsA4ZW+jvCiLLVUSohKQi0+LBrRiqEz8+deRdExnL/wLuB6j4GCINvz9PfHU7KHY8S4pzIFNkKDNswh5Pwlc3gyAn59uhOgcKjVdoLD24vsaSTjUIByPTMaeQBMsn52JobIgGhONdOD9NObO62OkUj6dikIWQ4nhYDbaX5i2R8nk9dD2Zdbbvsl1k++MgPYD5/TnPEe9C7puH50dAh9pVeSGk2PhtRmOHKNeeOtkXyq+4ARcY5pkgLJOdhsundiPNKwM57oFRnhQ9P5Uc1oOlEOOIHKWsDwLy6G1QV06pg2EJdbsYWTW00d6KhwGtpOa506cVMM3nfDGrIcp169ah5CeskGsgL2NzQO6hh9UgVSo0/AM=');

var code_marbleRun_1 = decode('hZBdVoMwEIWfzSpmA9AkSluWgyWKnhY4+anUnOzdmYlUUKvwEi5zv9w7zng4NdPw+GoO3oHSeitc1loz+g62DzULzpgWdloI5xvrhbDhaIDP8TScTfpU6AzRB9vXMv2UBt8Zu9Kdt83Lc+dXYhhXn+3w1s8XZA5AFHfRvkOB18BhsL2xKFyg0JBV6EADFqK3lCoxSqwpnOaKUnsJCFAr3j1MSMC//xHnHox7OjYe7RMa/jSFkabDSAUpxIWTo61UFWANWapdRYhvPprPsadF7CUnY5DxC2KzKW4+mU/5I/eXZQXpWs6GfpGdbvuayhukFMupvMooYN7wRIkgZZ0mIZJUV7glWco9r4rj8hLZx2WK20PpAw==');

var code_marbleRun_with_marbles = decode('hVNBboMwEDzXr5gPQMAVinOpVKlf6ANocEurgJExDYnF37u2gUIVUpCQmZ0Zze5CKw2qvFdvX/JoWvCMC9YGrJCNKcH33AOtlAXSLGOsNbk2zPbgHCWEGALAdHeS8GdbqW85jIg744wU1pZIB9Pp+pAMd2rKlFKvCXwktEbnnx+lWVZDBV1zAyzUub7tRPznunjZrjspMV6bqY9ZgKog2pNnWLDJbjxMEcFG49lo0nWNxTJeoIXeAcserL4iohnhqHQtNQEXRBwBRUvjojtOyMCFZmsHP73ZJhUJSJyuvB7RkwNV77nNfZwhnNv7KTekpq2PmiQ+iC3NQnAhYoYrPQWckl6O6qQ0dF4XqhrahvLK/5y7xll2jZuY6+ziR0GSOHXmURKn+wx/RI4cBtEvBrE0CR4+3Vq/20WbVzB37dm5v9+9665epPbfyMwKC3ERlqywGcswLax3cTAE3DFhHXTIaD5JnAg/JPozBx8i6Hwn0TZp+AE=');

var code_9_towers = decode('nZPRboMwDEWfx1fc50lUIVQdfA6lqahKy5RQFYj49zmBAOsYqDwg2ebaJ44dLSv4MWtVmaRXBc+Tj1yg87SHY5LnyoOuEURtWudkVr3Jre13Tmg1xjkWlXAZsNqykJcxYDRnmdxEWTyFdGn9j7S4/4mb8CSh7Y9oT4bbCQGH9j50A7bbQ+FgAmwXAhn8iEElJblRq74zIQUJSUM+fTECypANYkZaztquWQegrsbyAT5hESGlU+hgzQwTAEij6TbpMin1cj/RYXva1xzN3OaExTfA6ndgnGgOFm6ANe/AwnFOZh9e5sTHOQWvcyL9YvFuv1x1s1tbL45yH2qRZTfXocYd3Aq0FRaBM3s+PIn/qGxtGanA8riGRzcwV3uNsJ+BprJQar3LX8/5Bw==');

var code_flat_track = decode('dY7hboQgEIR/l6fYF9BDmmv0cTyl1Vbhsqx3toR37wLVxGsu/IFh5ps5neBu8cvBfaQBugVRG4KLNj2M83XSMz9bGq0RThPM7Wovn7ojB5VSb5vW6yuHlaqT4LTuoRbCUYskBC6ThnT3s73p8KfEO3ha0DQy/JcsDRoPuiNsx4+BNkD2AXjx4vEHCsZAZ9FoZOEbCgVZBV4GvDeeUlYh4cSRktp2VFVLYEB14L3CygT+fSSqB+K2M+Hep5Y4vnLg2YycikafimR5hrBTcDE7Oa/xAraRK5srCFmPTvBRas5cJEtZpzbuDQmfc02MFc9N4Rc=');

var code_flat_track_2 = decode('hZBdboMwEISf61PMBUC2KyI4Dk3c0iqBar1EpJbvXq9dUFH6I7+sRjPfjOwd49Iv09ObO7KHtfagfNFO7p0HGGvbrHjnTjDNQSnPPbFSNJ8d8h0u09XFL0VuBJ5p7HS8lyYeHO30QB8wGjfo2rQNFlTpiPiB8KfzHuyZ+teXgddlxQcE9SCkKtFxnGh0lIQbKouiYoCFh5FXa50ahKf2mFy3sUwrsyqzAz6mhUaY/yLXpZn3fO455ZeU2KW+hUpKjCE36bpB3Cg0jxu5zAkK68pFPg+x6OJEEKlrUpGudZvbUm/M+JLrdPnr30xRfQI=');

var code_pipework_45 = decode('hZLrjoJADIV/O09xXgBkQKP7NAaxWdwdwcxgBCfz7ltum0FESUhKW06/XgxVuKR1efyhrDLYJ7Ew7DJEJ8hYiOv5SkYIfVOEzrYCgEWOvSNFFyoq4Yb48A0r1mublarUOKo0+3VZqQvSh2NqSPi2bRAkqCGhH/iKXF9hpndHFEpf9Z6fK8IDQRTuJBoOJ9A1NttJJfsxgcvLcNcBcG7MZscBzYHNFks8dtKE1+uNZvpJqyxH3fptl0OPLU4zzgSGrZjfvkZDSpV3lzXqXJxI8y5ep08yGCNijIgbDeI2L3JLCPGIEG6fRJN/hqxJiyeCV9mLCMk7BG/Lmk4fLucBb7LB8mg90W9NVHw8yG5jQX8Jcu/rslLw/PTFPB0rVnbcW+5PYmXbMRkOsBvOXHPSNHjr2conv7pZZQHG+QM=');

var code_pipework_3waycorner = decode('nZPrjoIwEIV/26eYFyi2Bbw8jfEyCW4USctGLuHdd1pwhSLoromxTnu+mTnTGszhui9uhy885gY2qxUzFDKIJ4ikW9P2CbM8AaUEY9k5Q8OY/r4guHXNAKCGBDYNXvCKac6abr/7DzVbHG86Rb077A2yRV0CD6EACbqCrWha0Eh2BxEoK84Tjbj7BGHjgsICKohAlzN04tZWX/4y7ucTahcl9B9lqtXFUzoppetHOkAFXARrCxFBCLqAKG5G7clg7Rqkw4qWLpltiUeTWSacJoJ86ItZw2154DUIhlYKZHMsL+fUWgSOaz22XnNlz4lmimlHCA4axB41HFA9bDiHnWq01yefnf3L2+Rs4q3NctOXs+WS+5+W2QPZ0XZm0XvotWYTSOpYUVhBY7IENXbRwvd5KH2UPnoDHyWT73PFvtKZWAwP8Xhckbv3dSfyKiA9+WenTS+YMDR5EWzdLzlAdz3FtvxHYCB9Kyy75l7XpP5TVCCfcNnthvR97o5KDN9gQhcZVOnfIgZ0tX4A');

var code_pipework_3way = decode('rVNZboMwEP2uTzEXgNhmSXKaKMuoUCUE2VSBIO7esQ0RSwlJVb5gmLfMprGAy768Hr7wWGgQcRwzTTGNeAIhhP2ghBPmRQJRLBmrVQlb3uRpjpox9X1GsO81A4AaEtg0eMYLZgVr2v/tN9Ts43hVGardYa+RfdQVeAGUIEDdDacjmsBuwH1hwEWiEHevUJg4pzCHO4SgqlfYa5fmRHSh9ulnUizLhK0Mfy5jBAy+enDc0hMqGyXqN2HS4aI5HI2uV9gdPO6vDQn3A6D5hVEz6aLw17ZASpb0asVMSV44qzIzUGIQHb582nljD0YFAq0hSBDNsTqnmWkRWF7XYypamrxuAaec0nBaUu5HI9qAIn1i6Lr/Xnm96rynE/91VW1zPNdcsenD2WrljR/H2SMyA21bRMfWq8YICCpTUlhCo/MEFbbRctzdIbSzPjmwl8TEslY0RtomlsMkL5pzNLjG9z1Je6L/4MbeXt3dSzSWJwoaqNk5XxomyuD+FlympJPL0HnvAgPoIrCCiebAmPyjM1/0FNq/9lIefyc+gwWaYGp0vNsMaOF/AA==');

var code_facade = decode('rZPBjtMwEIbP66eYM1Ja22na7IUDSJwR8AJJY7RBSb2yU5LFyrszM3a6G6oWCdGqajL655vx7xlvBuirydY/zHHwsJNSChFeQMMv0Hp+smdvhHDnzgA/B/EwVl3nxRyD/AJ9Azt4D87a70mgxENwL/AokVPCBJncFPOSGVOjWsE7wHpKb3KUZiWAB4VfuXkENxFgBiWjCGPz+dQOX+x4oXAxxBSLpLySpHcUMWdC0aFg1Qc7qZWMAkEEHyW1nT5Z15Niu83ufq4Y261vG+MFl8sLIKSmk12ozOzbpunMVzS/tSfhezwN5n+0zigScOBza47mm33Wgg+Y093gX87MXfrlxRpc22GwPWVkJCBpHltY65xtkkgXzNUJi+YfinQZCl6T/rQLRtCBWDC2pwZtjzTFmJJvUio42s46qLuzgap7fqpioWrgtmoqSBWuWsJxoJ5UkWjEpUm62c0d4+Ge82H+B+/3ydQc4D+Zr17NV2pxX8PK/r+N4s3h/Gkc7kGT5lvuecfo4e2gs3LlxfU+sLX6EK3Yz4lL4exNHG5VWdLJ0B2dO2OdT1uv4t5fsEtTKR2CgBCdQUPJ2DRbzo4nHqUyDVY5Uw4g4Dc=');

var code_crosstower = decode('jZHtCoIwGIV/t6s4N6Dou0X+6lZCbFFQCM7oY3jv+W7LbIrIQNn27JzHaav6Wjd4nC+t7lA1ZauF0S2M1kfkJJUSorlftd/C7QjC3k/ICsAa5FDIO5ya8qYPJa8BvPpEkqVbvMHPFxKFb8EI8UQSEBkjvB7l0MB0sZqM1YjHCrVJ708tELRoFvzzeTX6uzYZ3GQ/1IwbR03qB0FauJkR9NcvXX+oVT02/VtZWrgQfrtUNeoOqZJTfWw4bcXG8tmd12auNsZtDgYR2n9bSnxkDVy43CLYiu4D');

var code_spiky = decode('tZHNboMwEITP5Snm3ENCqELK4ziwDa4Mi2znr4h372InaVDTKDlUQoLFs/PNrh15NOrA608qvcMiy/LExX8Vdb5G9h5qR1RhmSXJfA5fawd5FDbMFVxpdefheRTJIUE3nSo9+CNUFXmlDQztyIzt0YJAhhpqBaqstLHdylcrdl1N8sPxr2bstTGo1Y4E3Sjn9O7MGj25DR3ttlmTDXCrVbsx5FBaUp4qUY1C7aOTMgKJdu0lc4ua93ANswwfYh46ttKMuKPYuqYk6Y9Ywh6xSmG/kKdwyAbkeEVvD1IPbAUvQrs1hFigT9DLmpHO3lCgZMP2dDSEFcixWBaj2R3Ri3iks2KJo7xWI36RDvtae0qGP3Dvkiw6Bd0Q1/xvuIemW8kCJ6JTqLu8CAzVLVyc7v4urzU3WaebGyas/hw6vxn6mSg/g08u4/EsuIQpnrnV60QTSfHMTZwTfQM=');

var code_mondrian = decode('pVPBbqMwFDzXXzFSb1uF2oag5FKph80P7P6ACW5xRXAKZIuL+Pd9xiQkbSrtqhdsj9/MvLFxo1vsVGezF71tG8Scc8a2h0wzVh9KDT/t2U3vsEbdYc2HzDzvVaVLdpPgB/oOy0gCtcPiYpMYCxEomOFhkj0CJC24l3EQEU8GpEHTLzBAhNViXLppfMeCR8sBSpLc/f3OVnltVEVTQoL8EUNPKH4XGo3p8KS2uoF9QluEYIwIPbpRL550pY/ie8a0eTeCVzfffcRp7sbCM5XurNB9tJg3B4bQs5J4g/SXket9W9D0AXkI8Gtfmhamai3aN4tClX8oiKmou9zUdHHGVuTSgEdxQocmfKZTZx5O03TCeSTT7xu7D8bCWy9pcBfG4mTtRuPlKfPs3ZOZ72W8KNMg/HaFtQ1ZKdSqyu0OW1vaOgqkfOy3R3DwHkKGAtxuuD/X5vWgak2yc/15uVwdy3nCk0d5nXHhIGeHzeZnHP8DJT6nUBJxjSIuc6y+pgTOtPSBWO9vdi3Dh54MHXxmOw/TO1khAx/ggU9civMf7L8=');

var code_doughnut = decode('lZJBboMwEEXX8SnmAhAbhyRsuqiqquveAAiN0kItOUQiQb57/9gmCY1UqUY2MJ7/5jP42PTUlYOpPpu6P5KSGEL0xmZCCHtqG+Jn6nak16NY1AdbZ2IxDiTTLZ2xypzsBTrnNS6KfB6r1Jae/JuGeoQikWlOKASpwuoqM7wa2zEUmJCgCHyyA7CcmsoNpyoXqt/X0LHGP+HJjS7T4gbXDA/0ScpkzpLr3H8znjZkz1TIia6ujqYA7HjNlsHphhu0ch/G9A/4mIosjZmxGwp0NpjcVMtl8teI1GNXtu2bsYfLu9l5smLXYdamNZaq9tSw86vpmSabRNyTIDC2/N5fJUHDrtAYvj0jvpgxfLO1m3N9MHmIujsgSKHZ+C8afnGbLJf1lzfAuzndbe1tc447AxUuYl6avjy0ygeTh+ivmjHMpXE+Mj4dCudiRQWuUAUd2JluasEP');


//console.log(code_all)
var documents = [ { filename: 'Untitled', filetype: 'text/plain', autoupdate: true, code: code_all } ];

if ( localStorage.codeeditor !== undefined ) {

  documents = JSON.parse( localStorage.codeeditor );

}

var detail;
if(localStorage.getItem('detail_level')) {
  detail = JSON.parse(localStorage.getItem('detail_level'));
} 

if ( window.location.hash ) {

  var hash = window.location.hash.substr( 1 );
  var version = hash.substr( 0, 2 );

  if ( version == 'A/' ) {

    alert( 'That shared link format is no longer supported.' );

  } else if ( version == 'B/' ) {

    documents[ 0 ].code = decode( hash.substr( 2 ) );

  }

}

// preview

var preview = document.getElementById( 'preview' );

// editor

var interval;

var editor = document.getElementById( 'editor' );
var codemirror = CodeMirror( editor, {

  value: documents[ 0 ].code,
  mode: 'text/html',
  lineNumbers: true,
  matchBrackets: true,
  indentWithTabs: true,
  tabSize: 2,
  indentUnit: 2,
  smartIndent: true
} );

codemirror.on( 'change', function() {

  buttonSave.style.display = '';
  buttonDownload.style.display = 'none';

  if ( documents[ 0 ].autoupdate === false ) return;

  clearTimeout( interval );
  interval = setTimeout( update, 500 );

} );

// toolbar

var toolbar = document.getElementById( 'toolbar' );

var buttonUpdate = document.createElement( 'button' );
buttonUpdate.className = 'button';
buttonUpdate.title = "Force update manually";

var checkbox = document.createElement( 'input' );
checkbox.title = "Toggle auto-update";
checkbox.id = "AutoUpdate";
checkbox.type = 'checkbox';

if ( documents[ 0 ].autoupdate === true ) {
  checkbox.checked = true;
  buttonUpdate.innerHTML="Autoupdate";
}else{
  checkbox.checked = false;
  buttonUpdate.innerHTML="Update"; 
} 
checkbox.style.cssText = 'margin:-4px 10px -4px -4px;position:relative;top:3px;left:12px';
checkbox.addEventListener( 'click', function ( event ) {
    event.stopPropagation();
    documents[ 0 ].autoupdate = documents[ 0 ].autoupdate === false;
    localStorage.codeeditor = JSON.stringify( documents );
    if ( documents[ 0 ].autoupdate === true ) {
      checkbox.checked = true;
      buttonUpdate.innerHTML="Autoupdate";
    }else{
      checkbox.checked = false;
      buttonUpdate.innerHTML="Update"; 
    }
    buttonUpdate.appendChild( checkbox );
  }, false );
buttonUpdate.appendChild( checkbox );

buttonUpdate.addEventListener( 'click', function ( event ) {
  update();
}, false );
toolbar.appendChild( buttonUpdate );
//====================


var buttonMenu = document.createElement( 'button' );
buttonMenu.className = 'button';
buttonMenu.title = 'Show menu';
buttonMenu.innerHTML = '<svg width="8" height="8"><path d="M 0,1.5 8,1.5 M 0,4.5 8,4.5 M 0,7.5 8,7.5"></svg>';
buttonMenu.addEventListener( 'click', function ( event ) {
  menu.style.display = menu.style.display === '' ? 'none' : '';
}, false );
toolbar.appendChild( buttonMenu );
//========================

var buttonHide = document.createElement( 'button' );
buttonHide.className = 'button';
buttonHide.textContent = 'hide code';
buttonHide.title = 'Toggle code editor';
buttonHide.addEventListener( 'click', function ( event ) {
  toggle();
}, false );
toolbar.appendChild( buttonHide );
//================

toolbar.appendChild( document.createElement( 'br' ) );

var menu = document.createElement( 'span' );
menu.style.display = 'none';
toolbar.appendChild( menu );
//=====================

var buttonSave = document.createElement( 'button' );
buttonSave.className = 'button';
buttonSave.innerHTML = 'save<br>script';
buttonSave.addEventListener( 'click', function ( event ) {
  save();
}, false );
menu.appendChild( buttonSave );
//=================
var buttonDownload = document.createElement( 'a' );
buttonDownload.className = 'button';
buttonDownload.style.display = 'none';
buttonDownload.download = 'index.html';
buttonDownload.textContent = 'download';
buttonDownload.addEventListener( 'click', function ( event ) {
  buttonSave.style.display = '';
  buttonDownload.style.display = 'none';
}, false );
menu.appendChild( buttonDownload );
//======================

var buttonShare = document.createElement( 'button' );
buttonShare.className = 'button';
buttonShare.innerHTML = 'share<br>script';
buttonShare.addEventListener( 'click', function ( event ) {

  var dom = document.createElement( 'input' );
  var location = window.location;

  dom.value = location.origin + location.pathname + '#B/' + encode( codemirror.getValue() );
  dom.style.width = '400px';
  dom.style.padding = '5px';
  dom.style.marginTop = '20px';
  dom.style.border = '0px';

  popup.set( dom );
  popup.show();

  dom.focus();
  dom.select();

}, false );
menu.appendChild( buttonShare );
//===============================

var buttonReset = document.createElement( 'button' );
buttonReset.className = 'button';
buttonReset.innerHTML = 'Example<br>scripts';
buttonReset.addEventListener( 'click', function ( event ) {

	popup.set(div);
	div.style.display = '';
	popup.show();
	
}, false );
menu.appendChild( buttonReset );
//========================


var div = document.querySelector("#container"),
	frag = document.createDocumentFragment(), 
	sel = document.createElement("select");

div.innerHTML = 'Select your script&nbsp';
//sel.options.add( new Option("script","33") );
sel.options.add( new Option("All elements",code_all) );
sel.options.add( new Option("Box torus",code_boxtorus) );
sel.options.add( new Option("Spiral",code_spiral) );
sel.options.add( new Option("Planes",code_planes) );
sel.options.add( new Option("Beddards Pyramid",code_beddard) );
sel.options.add( new Option("Cube arcs",code_cubearc) );
sel.options.add( new Option("Fancy cube arcs",code_fancyarc) );
sel.options.add( new Option("StrucSynth S",code_s) );
sel.options.add( new Option("Marble run",code_marbleRun_1) );
sel.options.add( new Option("Marble run with marbles",code_marbleRun_with_marbles) );
sel.options.add( new Option("9 towers",code_9_towers) );
sel.options.add( new Option("flat track",code_flat_track) );
sel.options.add( new Option("flat track 2",code_flat_track_2) );
sel.options.add( new Option("pipework with 45 angle",code_pipework_45) );
sel.options.add( new Option("pipework 3way corner",code_pipework_3waycorner) );
sel.options.add( new Option("pipework 3way",code_pipework_3way) );
sel.options.add( new Option("house facade",code_facade) );
sel.options.add( new Option("frame tower",code_crosstower) );
sel.options.add( new Option("spiky",code_spiky) );
sel.options.add( new Option("Mondiran cube",code_mondrian) );
sel.options.add( new Option("doughnut",code_doughnut) );

frag.appendChild(sel);
div.appendChild(frag);
sel.style.width = '150px';
sel.style.padding = '5px';
sel.style.background = 'rgba(120,120,120, 0.7)'
sel.style.fontFamily = 'Arial'
sel.style.fontSize = '14px'
sel.style.color = 'rgb(235,235,235)'
div.style.width = '300px';
div.style.padding = '5px';
div.style.marginTop = '10px';
div.style.textAlign = 'center';
div.style.display = 'none';

var divselect = document.createElement( 'button' );
divselect.className = 'button';
divselect.innerHTML = 'Click here to load script<br><br><a style="color:red;">CAREFUL!!</a><br><br>This will replace the current editor script';
divselect.addEventListener( 'click', function ( event ) {
	codemirror.setValue( sel.options[sel.selectedIndex].value );
	save();
	sel.selectedIndex = 0;
  popup.hide();
  if(!document.getElementById("AutoUpdate").checked){
    update(); /// check if autoupdate is on - if it is do not do update or you are doing it twice
  }


  // material export -- set name of material to mat_r_g_b_a_s_b red green blue alpha saturation bright - this schould group the material
  // if I then export by name

  // also check if alpha is passed through in eisenscript to the actual renderer
  // opacity exported???
	
}, false );
div.appendChild( divselect );


var buttonAbout = document.createElement( 'button' );
buttonAbout.className = 'button';
buttonAbout.textContent = 'about';
buttonAbout.addEventListener( 'click', function ( event ) {

  var dom = document.createElement( 'div' );
  dom.style.width = '400px';
  dom.style.padding = '5px';
  dom.style.border = '0px';
  dom.style.textAlign = 'centerleft';
  dom.innerHTML = '<h1>BrowserSynth Editor v 0.9 <\/h1>Very much based on this <a href="https://github.com/after12am/eisenscript-editor" target="_blank">source code</a><br>I have added more geometries, use the newer three.js library version 115 and changed a couple of things.<br>Powered by <a href="http://codemirror.net/" target="_blank">CodeMirror ' + CodeMirror.version + '</a><br><br>There are some example scripts provided<br>So far syntax errors only appear in the javascript console<br>The share button encodes the current script into a link which can be send/posted and the script is in it.<br><br>For any questions and/or problems head over to github and raise an issue.</a>';
  popup.set( dom );
  popup.show();

}, false );
menu.appendChild( buttonAbout );

// popup

var popup = ( function () {

  var scope = this;

  var element = document.getElementById( 'popup' );
  element.style.display = 'none';

  var buttonClose = ( function () {

    var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
    svg.setAttribute( 'width', 32 );
    svg.setAttribute( 'height', 32 );

    var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
    path.setAttribute( 'd', 'M 9,12 L 11,10 L 15,14 L 19,10 L 21,12 L 17,16 L 21,20 L 19,22 L 15,18 L 11,22 L 9,20 L 13,16' );
    path.setAttribute( 'fill', 'rgb(235,235,235)' );
    svg.appendChild( path );

    return svg;

  } )();

  buttonClose.style.position = 'absolute';
  buttonClose.style.top = '5px';
  buttonClose.style.right = '5px';
  buttonClose.style.cursor = 'pointer';
  buttonClose.addEventListener( 'click', function ( event ) {

    scope.hide();

  }, false );
  element.appendChild( buttonClose );

  var content = document.createElement( 'div' );
  element.appendChild( content );

  function update() {

    element.style.left = ( ( window.innerWidth - element.offsetWidth ) / 2 ) + 'px';
    element.style.top = ( ( window.innerHeight - element.offsetHeight ) / 2 ) + 'px';

  }

  window.addEventListener( 'load', update, false );
  window.addEventListener( 'resize', update, false );

  //

  this.show = function () {

    element.style.display = '';
    update();

  };

  this.hide = function () {

    element.style.display = 'none';

  };

  this.set = function ( value ) {

    while ( content.children.length > 0 ) {

      content.removeChild( content.firstChild );

    }

    content.appendChild( value );

  };

  return this;

} )();


// events

document.addEventListener( 'drop', function ( event ) {

  event.preventDefault();
  event.stopPropagation();

  var file = event.dataTransfer.files[ 0 ];

  documents[ 0 ].filename = file.name;
  documents[ 0 ].filetype = file.type;

  var reader = new FileReader();

  reader.onload = function ( event ) {

    codemirror.setValue( event.target.result );

  };

  reader.readAsText( file );

}, false );

document.addEventListener( 'keydown', function ( event ) {

  if ( event.keyCode === 13 && ( event.ctrlKey === true || event.metaKey === true ) ) {

    update();

  }

  if ( event.keyCode === 27 ) {

    toggle();

  }

}, false );



window.addEventListener("storage", function () {
  // need to check if detail level has changed so I can re-create everything.
  // problem is - if no seed is set it will be changed!!!
  if(localStorage.getItem('detail_level')) {
    new_detail = JSON.parse(localStorage.getItem('detail_level'));
  } 
  if(detail != new_detail){
    detail = new_detail;
    update();
    //alert("detail change");
  } 
}, false);


// actions

function update() {

  var value = codemirror.getValue();

  if ( validate( value ) ) {

    // remove previous iframe

    if ( preview.children.length > 0 ) {

      preview.removeChild( preview.firstChild );

    }

    //

    var iframe = document.createElement( 'iframe' );
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    preview.appendChild( iframe );

    var content = iframe.contentDocument || iframe.contentWindow.document;

    // workaround for chrome bug
    // http://code.google.com/p/chromium/issues/detail?id=35980#c12

    // value = value.replace( '<script>', '<script>if ( window.innerWidth === 0 ) { window.innerWidth = parent.innerWidth; window.innerHeight = parent.innerHeight; }' );
    container = container.replace( '<script>', '<script>if ( window.innerWidth === 0 ) { window.innerWidth = parent.innerWidth; window.innerHeight = parent.innerHeight; }' );
    value = container.replace('%s', value);
    content.open();
    content.write( value );
    content.close();

  }

}

// need to get the eisenscript validation in here
function validate( value ) { return true}


function save() {

  documents[ 0 ].code = codemirror.getValue();

  localStorage.codeeditor = JSON.stringify( documents );

  var blob = new Blob( [ codemirror.getValue() ], { type: documents[ 0 ].filetype } );
  var objectURL = URL.createObjectURL( blob );

  buttonDownload.href = objectURL;

  var date = new Date();
  buttonDownload.download = "Eisenscript.txt";

  buttonSave.style.display = 'none';
  buttonDownload.style.display = '';

}

function toggle() {

  if ( editor.style.display === '' ) {

    buttonHide.textContent = 'show code';
    editor.style.display = 'none';
    buttonUpdate.style.display = 'none';
    buttonShare.display = 'none';
    buttonMenu.style.display = 'none';
    menu.style.display = 'none';

  } else {

    buttonHide.textContent = 'hide code';

    editor.style.display = '';
    buttonUpdate.style.display = '';
    buttonShare.display = '';
    buttonMenu.style.display = '';

  }

}

update();
