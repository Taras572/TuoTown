import { Component, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  public screenWidth: any;
  public screenHeight: any;

  constructor(
    private toastr: ToastrService
  ) {

  }
  @HostListener('window:resize', ['$event'])


  ngOnInit() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth < 700) this.showSuccess();
  }

  showSuccess() {
    this.toastr.warning('Адмін панель не адаптується до малих розмірів екрану');
  }

}
