import { Controller, Get } from "@nestjs/common";

@Controller("/app")
export class AppController {
  @Get("/greet")
  getrootRoute() {
    return "Hello";
  }

  @Get("/welcome")
  getWelCome() {
    return "Welcomes";
  }

  @Get("/bye")
  getByeRoute() {
    return "Bye";
  }
}
