import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CLIENT_ID, FAKE_LOADER_TIME } from 'src/app/shared/helper';
import { Client } from 'src/app/shared/models/client.model';
import { MockApiService } from 'src/app/shared/services';
import { ClientManagePanelComponent } from '../client-manage-panel/client-manage-panel.component';

@Component({
  selector: 'client-list',
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  @ViewChild('filterInput') filterInput: ElementRef;
  @HostBinding('class') class = 'content';
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }
  @ViewChild('clientTable', { static: true }) clientTable!: MatTable<Client>;
  displayedColumns: string[] = ['FirstName', 'LastName', 'IsActive', 'Gender', 'ExpirationDate', 'Balance'];
  dataSource = new MatTableDataSource<Client>();
  fakeLoader = false;
  clientId: string | null;
  clientTitle: string | undefined;
  private overlayRef!: OverlayRef;
  private unsubscribe$ = new Subject<boolean>();
  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private mockApiService: MockApiService
  ) {
    this.clientId = this.route.snapshot.queryParamMap.get(CLIENT_ID);
    if (this.clientId) {
      this.onOpenManagePanel(this.clientId);
    }

    this.clientTitle = this.route.parent?.snapshot.url[0].path;
  }

  ngOnInit(): void {
    this.getMockData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  onOpenManagePanel(clientId?: string): void {
    if (clientId) {
      this.setClientId(clientId);
    }

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      panelClass: 'panel-primary',
      height: '100svh',
      maxHeight: '100svh',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions([
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom',
          }
        ])
    });

    this.overlayRef
      .backdropClick()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.setClientId();
        this.overlayRef.detach();
      });

    const popupComponent = this.overlayRef.attach(new ComponentPortal(ClientManagePanelComponent)).instance;
    popupComponent.clientId = clientId || '-1';

    popupComponent.clientAction$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.setClientId();
        this.getMockData();
        setTimeout(() => {
          this.clientTable?.renderRows();
          this.dataSource._updateChangeSubscription();
        }, FAKE_LOADER_TIME)
      })

    popupComponent.closeSubject$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.setClientId();
        this.overlayRef.dispose();
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  cleanFilter(): void {
    this.filterInput.nativeElement.value = '';
    this.dataSource.filter = '';
  }

  private setClientId(params?: string): void {
    this.router.navigate([], {
      queryParams: {
        [`${CLIENT_ID}`]: params ? params : null,
      },
    });
  }

  private getMockData(): void {
    this.mockApiService
      .getClients()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        this.fakeLoader = true;
        setTimeout(() => {
          this.fakeLoader = false;
          this.dataSource.data = response;
        }, FAKE_LOADER_TIME)
      });
  }

}
