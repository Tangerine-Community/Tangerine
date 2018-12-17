import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TruncatePipe} from "../pipes/truncate";


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [TruncatePipe],
    exports:      [TruncatePipe],

})
export class UtilsModule { }
