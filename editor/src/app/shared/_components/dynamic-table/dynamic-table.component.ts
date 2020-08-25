import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit {

  @Input() data:Array<any> = []
  @Input() columnLabels = {}
  columns:Array<any>
  displayedColumns:Array<any>
  dataSource:any

  ngOnInit(): void {
    debugger
    // Get list of columns by gathering unique keys of objects found in DATA.
    const columns = this.data 
      .reduce((columns, row) => {
        return [...columns, ...Object.keys(row)]
      }, [])
      .reduce((columns, column) => {
        return columns.includes(column)
          ? columns
          : [...columns, column]
      }, [])
    // Describe the columns for <mat-table>.
    this.columns = columns.map(column => {
      return { 
        columnDef: column,
        header: column,
        cell: (element: any) => `${element[column] ? element[column] : ``}`     
      }
    })
    this.displayedColumns = this.columns.map(c => c.columnDef);
    // Set the dataSource for <mat-table>.
    this.dataSource = this.data 
  }

}
