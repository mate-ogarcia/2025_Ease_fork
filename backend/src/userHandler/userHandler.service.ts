import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class UserHandler implements OnModuleInit {
    /**
   * @brief Called when the module is initialized.
   * You can use this method to perform any setup or initialization tasks.
   */
    async onModuleInit() {
        // TODO ? IDK if needed
        console.log("UserHandler module initialized.");
    }
}