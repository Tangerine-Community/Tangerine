import { MatTable } from '@angular/material/table';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges } from '@angular/core';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit, OnChanges {

  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowArchive: EventEmitter<any> = new EventEmitter<any>();
  @Input() data:Array<any> = []
  @Input() columnLabels = {}
  @Input() hideActionBar
  @Input() showArchiveButton
  columns:Array<any>
  displayedColumns:Array<any>
  dataSource:any

  ngOnInit(): void {
    this.render()
  }
  
  ngOnChanges() {
    this.render()
  }

  render() {
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
    this.displayedColumns = this.hideActionBar? [...this.columns.map(c => c.columnDef)]:[...this.columns.map(c => c.columnDef), 'actions']
    // Set the dataSource for <mat-table>.
    this.dataSource = this.data 
  }

  onRowClick(event,row) {

    if (event.target.tagName === 'MAT-ICON'){
      event.stopPropagation()
    }else{
      this.rowClick.emit(row)
    }
  }
  onRowEdit(row) {
    this.rowEdit.emit(row)
  }
  onRowDelete(row) {
    this.rowDelete.emit(row)
  }
  onRowArchive(row) {
    this.rowArchive.emit(row)
  }



}
