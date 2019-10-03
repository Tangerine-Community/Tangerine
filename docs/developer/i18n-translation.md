i18n/Translation

# Translation

To translate strings:

```
{{'Curriculum'|translate}}
```

Enter string in translation.json

You can also use the translation marker service to translate data structures in your ts files:

```
  status:string[] =  [_TRANSLATE('Concerning'), _TRANSLATE('Poor'), _TRANSLATE('Good'), _TRANSLATE('Great')]

```


```
{{element.status| translate}}
```

Mat-pagination needs a special service to enable use of translation.json - see class/_services/mat-pagination-intl.service.ts

# RTL

Mat-menu does not support RTL out of the box, but it's simple to get it working: add `dir="rtl"` to its enclosing element.

```
<span dir="rtl">&nbsp;&nbsp;&nbsp;
  <button mat-button [matMenuTriggerFor]="reportsMenu" class="mat-button">{{'Select Report'|translate}}</button>
  <mat-menu #reportsMenu="matMenu">
    <button mat-menu-item [matMenuTriggerFor]="groupingMenu">Class grouping</button>
  </mat-menu>
  <mat-menu #groupingMenu="matMenu">
    <button mat-menu-item *ngFor="let item of formList" routerLink="/reports/{{item.id}}/{{item.classId}}">{{item.title}}</button>
  </mat-menu>
</span>
```

mat-table also needs some twekas to work - Css:

```

.mat-column-Name {
  padding-right:5px;
}

th.mat-header-cell {
  text-align: right;
}
```


