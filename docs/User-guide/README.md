# Generating the user guide

*Prerequisites* 
- pandoc
- xlatex library

in the same folder execute:
> pandoc  -V geometry:nohead,nofoot,top=1cm,bottom=1cm,right=1.5cm,left=1.5cm -S -s TitlePage.md --latex-engine=xelatex -o TitlePage.pdf --template=NoPageNum.latex --number-sections

This will create the titile page without header numbers, {-} indicates that no numbers will be selected

Now execute:
> pandoc --no-tex-ligatures -s -V geometry:nohead,nofoot,right=1.5cm,left=2cm,bottom=2.5cm  TangerineOjai_Full_UserManual.md --latex-engine=pdflatex --toc -o BodyPage.pdf

swtich the layout to landscape of the last page
pandoc -V geometry:landscape,nohead,nofoot,top=1cm,bottom=1cm,right=1.5cm,left=1.5cm-S -s Annex5.md --latex-engine=xelatex -o Annex5Page.pdf --template=NoPageNum.latex --number-sections --no-tex-ligatures

Now we have the body with the TOC

In your PDF reader combine the three documents and publish it