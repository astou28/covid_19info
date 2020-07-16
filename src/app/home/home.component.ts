import { Country } from './../../dataModel/Country.model';
import { GetApiService } from './../get-api.service';
import { combineLatest } from 'rxjs';
import * as Fuse from 'fuse.js'
import { Donnee } from './../donnee';
import { Component, OnInit, NgZone } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import COUNTRY_CODES from "../shared/utils/countries";


am4core.useTheme(am4themes_animated);


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  today: number = Date.now();
  sort = 'cases';
  table: any = [];
  public countries: any = [];

  country: string;
  countrySize: any;
  countriesSize: any;
  totalCases: number;
  totalDeaths: number;
  totalRecovered: number;
  totalUnderTreatments: number;
  totalCriticals: number;
  totalStables: number;
  totalTodayCases: number;
  totalTodayDeaths: number;
  totalTodayRecovered: number;
  public totalRecoveries;
  public totalCritical;
  public todayCases;
  public todayDeaths;
  public activeCases;
  public casesPer1M;
  public finishedCases;
  public isLoadingMap: boolean = true;
  private mapChart: am4maps.MapChart;
  public sortType = 'todayCases';
  public fuse: any;
  public fuseResults: any[];

  public countryCodes = COUNTRY_CODES;

  constructor(private zone: NgZone, private GetApiService: GetApiService) {}
  calculateSum(index, array = this.countries) {
    var total = 0;
    for (var i = 0, _len = array.length; i < _len; i++) {
      total += array[i][index];
    }
    return total;
  }
  async ngOnInit() {
    this.apiCall();
    this.apiContries();
    this.zone.runOutsideAngular(async () => {
      combineLatest(this.GetApiService.apiCallBySort(this.sortType)).subscribe(
        ([getAllData]) => {
          this.isLoadingMap = false;
          this.countries = getAllData;
          this.totalCases = this.calculateSum('cases');
          this.totalDeaths = this.calculateSum('deaths');
          this.totalRecoveries = this.calculateSum('recovered');
          this.totalCritical = this.calculateSum('critical');
          this.todayCases = this.calculateSum('todayCases');
          this.todayDeaths = this.calculateSum('todayDeaths');
          this.activeCases = this.calculateSum('active');
          this.casesPer1M = this.calculateSum('casesPerOneMillion');
          this.finishedCases = this.totalDeaths + this.totalRecoveries;
          this.fuse = new Fuse(this.countries, {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            minMatchCharLength: 1,
            keys: ['country'],
          });
        }
      );
    });
  }
  mafonction(opte) {
    // ____________________debut carte___________________ //
    this.isLoadingMap = true;
    if (this.mapChart) {
      this.mapChart.dispose();
    }
    let color = '#21AFDD';
    if (opte == 'recovered') {
      color = '#10c469';
    } else if (opte == 'critical') {
      color = '#f9c851';
    } else if (opte == 'deaths') {
      color = '#ff5b5b';
    }
    let mapData = [];
    this.fuse.list.forEach((element) => {
      if (element[opte] != 0) {
        mapData.push({
          id: this.countryCodes[element.country],
          name: element.country,
          value: element[opte],
          color: am4core.color(color),
        });
      }
    });

    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create map instance
    let chart = am4core.create('chartdiv', am4maps.MapChart);

    // Set map definition
    chart.geodata = am4geodata_worldLow;

    // Set projection
    chart.projection = new am4maps.projections.Miller();
    chart.panBehavior = 'rotateLongLat';

    let grid = chart.series.push(new am4maps.GraticuleSeries());
    grid.toBack();

    // Create map polygon series
    let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

    // Make map load polygon (like country names) data from GeoJSON
    polygonSeries.useGeodata = true;
    polygonSeries.mapPolygons.template.nonScalingStroke = true;
    polygonSeries.mapPolygons.template.strokeOpacity = 0.5;

    // Configure series
    let polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = '{name}: [bold]{value}[/]';

    polygonTemplate.fill = chart.colors.getIndex(0);

    // Create hover state and set alternative fill color
    let hs = polygonTemplate.states.create('hover');
    hs.properties.fill = chart.colors.getIndex(0).brighten(-0.5);

    //  let linkContainer = chart.createChild(am4core.Container);
    //  linkContainer.isMeasured = false;
    //  linkContainer.layout = 'horizontal';
    //  linkContainer.x = am4core.percent(50);
    //  linkContainer.y = am4core.percent(90);
    //  linkContainer.horizontalCenter = 'middle';

    //  let equirectangular = linkContainer.createChild(
    //    am4core.TextLink
    //  );

    //  let orthographic = linkContainer.createChild(
    //    am4core.TextLink
    //  );

    // ____________________fin carte______________________ //
  }

  apiContries() {
    this.GetApiService.apiCallCountrie().subscribe((data) => {
      this.table = data;
    });
  }
  // apiCall
  apiCall = () => {
    this.GetApiService.apiCallBySort(this.sort).subscribe(
      (data) => {
        this.countrySize = data;
        this.totalCases = this.totalNumber('cases');
        this.totalDeaths = this.totalNumber('deaths');
        this.totalRecovered = this.totalNumber('recovered');
        this.totalUnderTreatments = this.totalNumber('active');
        this.totalCriticals = this.totalNumber('critical');
        this.totalStables = this.totalUnderTreatments - this.totalCriticals;
        this.totalTodayCases = this.totalNumber('TodayCases');
        this.totalTodayDeaths = this.totalNumber('TodayDeaths');
        this.totalTodayRecovered = this.totalNumber('todayRecovered');
      },
      (err) => {
        alert('erreur');
      }
    );
  };

  totalNumber = (index: string, array = this.countrySize): number => {
    let total = 0;
    for (const elmt of array) {
      total += elmt[index];
    }
    return total;
  };
  Search() {
    if (this.country != '') {
      this.table = this.table.filter((res) => {
        return res.country
          .toLocaleLowerCase()
          .match(this.country.toLocaleLowerCase());
      });
    } else if (this.country == '') {
      this.ngOnInit();
    }
  }
}
