import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  Query,
} from "@nestjs/common";
import { TablesService } from "./tables.service";
import { OrgGuard } from "@/auth/organizations.guard";
import { TrackingInterceptor } from "@/interceptors/tracking/tracking.interceptor";
import { ZodSerializerDto } from "nestjs-zod";
import { ApiOkResponse } from "@nestjs/swagger";
import { HydratedTable, HydratedTableSchema } from "@/definitions";
import {
  GetAllTablesResponseDto,
  GetTableResponseDto,
  UpdateTableRequestDto,
  UpdateTableRowRequestDto,
} from "./dtos/table.dto";

@Controller("tables")
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get("/db/:databaseId")
  @ZodSerializerDto(HydratedTableSchema)
  @ApiOkResponse({ type: GetAllTablesResponseDto })
  findAllForDatabase(
    @Param("databaseId") databaseId: string,
  ): Promise<HydratedTable[]> {
    return this.tablesService.findAllForDatabase(databaseId);
  }

  @Get("/:id/results")
  @ApiOkResponse()
  @UseGuards(OrgGuard("table"))
  getTableResults(@Param("id") id: string, @Query() queryParams: any) {
    const filters = queryParams.filters
      ? JSON.parse(queryParams.filters)
      : null;
    const order = queryParams.order ? JSON.parse(queryParams.order) : null;
    const take = queryParams.take ? JSON.parse(queryParams.take) : null;
    return this.tablesService.getTableResults(id, filters, order, take);
  }

  @Get("/:id/pk")
  @ApiOkResponse()
  @UseGuards(OrgGuard("table"))
  getTablePk(@Param("id") id: string) {
    return this.tablesService.getTablePk(id);
  }

  @Get("/:id/enums")
  @ApiOkResponse()
  @UseGuards(OrgGuard("table"))
  async getTableEnums(@Param("id") id: string) {
    return this.tablesService.getTableEnums(id);
  }

  @Get("/:id")
  @ZodSerializerDto(HydratedTableSchema)
  @ApiOkResponse({ type: GetTableResponseDto })
  @UseGuards(OrgGuard("table"))
  findOne(@Param("id") id: string): Promise<HydratedTable | null> {
    return this.tablesService.findOne(id);
  }

  @Patch("/:id")
  @UseGuards(OrgGuard("table"))
  @UseInterceptors(TrackingInterceptor)
  @ZodSerializerDto(HydratedTableSchema)
  @ApiOkResponse({ type: GetTableResponseDto })
  updateTable(
    @Param("id") id: string,
    @Body() body: UpdateTableRequestDto,
  ): Promise<HydratedTable> {
    return this.tablesService.updateTable(id, body);
  }

  @Patch("/:id/row")
  @UseGuards(OrgGuard("table"))
  @UseInterceptors(TrackingInterceptor)
  @ApiOkResponse()
  updateTableRows(
    @Param("id") id: string,
    @Body() body: UpdateTableRowRequestDto,
  ) {
    return this.tablesService.updateTableRow(id, body);
  }

  @Delete("/:id")
  @UseGuards(OrgGuard("table"))
  @UseInterceptors(TrackingInterceptor)
  @ZodSerializerDto(HydratedTableSchema)
  @ApiOkResponse({ type: GetTableResponseDto })
  deleteTable(@Param("id") id: string): Promise<HydratedTable> {
    return this.tablesService.deleteTable(id);
  }
}
