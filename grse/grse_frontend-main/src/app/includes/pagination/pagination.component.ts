import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import TableOptions from 'src/app/models/TableOptions';
import * as Global from 'src/app/globals';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {
  @Input() rows: any[] = [];

  @Input() tableOptions: TableOptions = {
    'page': 1,
    'limit': Global.TableLength,
    'pagingCounter': 0,
    'totalDocs': 0,
    'totalPages': 0,
    'hasNextPage': false,
    'hasPrevPage': false,
    'nextPage': '',
    'prevPage': '',
  };

  @Output() onPrevPageClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() onNextPageClicked: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

}
