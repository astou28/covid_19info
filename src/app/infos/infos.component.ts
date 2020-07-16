import { Component, OnInit } from '@angular/core';
import { GetApiService } from './../get-api.service';


@Component({
  selector: 'app-infos',
  templateUrl: './infos.component.html',
  styleUrls: ['./infos.component.scss'],
})
export class InfosComponent implements OnInit {
  table: any = [];

  constructor(private GetApiService: GetApiService) {}

  ngOnInit(): void {
    this.apiContries();
  }
  apiContries() {
    this.GetApiService.apiCallCountrie().subscribe((data) => {
      this.table = data;
    });
  }

}
