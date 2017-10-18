# Generating the user guide

*Prerequisites* 
- pandoc
- xlatex library

in the same folder execute:
> pandoc  -V geometry:nohead,nofoot,top=1cm,bottom=1cm,right=1.5cm,left=1.5cm -S -s TitlePage.md --latex-engine=xelatex -o TitlePage.pdf --template=NoPageNum.latex --number-sections
This will create the titile page without header numbers, {-} indicates that no numbers will be selected

Now execute:
> pandoc --no-tex-ligatures -s -V geometry:nohead,nofoot,right=1.5cm,left=2cm,bottom=2.5cm  TangerineOjai_Full_UserManual_July_2017.md --latex-engine=pdflatex --toc -o BodyPage.pdf

Now we have the body with the TOC

In your PDF reader combine the two documents and publish it