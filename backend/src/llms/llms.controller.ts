import {
  Controller,
  // Get,
  // Post,
  // Body,
  // Patch,
  // Param,
  // Delete,
} from "@nestjs/common";
import { LlmsService } from "./llms.service";
// import { CreateLlmDto } from "./dto/create-llm.dto";
// import { UpdateLlmDto } from "./dto/update-llm.dto";

@Controller("llms")
export class LlmsController {
  constructor(private readonly llmsService: LlmsService) {}

  // @Post()
  // create(@Body() createLlmDto: CreateLlmDto) {
  //   return this.llmsService.create(createLlmDto);
  // }

  // @Get()
  // findAll() {
  //   return this.llmsService.findAll();
  // }

  // @Get(":id")
  // findOne(@Param("id") id: string) {
  //   return this.llmsService.findOne(+id);
  // }

  // @Patch(":id")
  // update(@Param("id") id: string, @Body() updateLlmDto: UpdateLlmDto) {
  //   return this.llmsService.update(+id, updateLlmDto);
  // }

  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.llmsService.remove(+id);
  // }
}
