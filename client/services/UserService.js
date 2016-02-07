define(["require", "exports", "./../models/UserData"], function (require, exports, UserData) {
    var UserService = (function () {
        function UserService() {
            this.UserData = new UserData;
            this.OtherUsers = {};
        }
        UserService.prototype.AddUser = function (user) {
            this.OtherUsers[user.uId] = user;
            console.log('adduser', this, user);
            this.redraw();
        };
        ;
        UserService.prototype.RemoveUser = function (user) {
            delete this.OtherUsers[user.uId];
            this.redraw();
        };
        ;
        UserService.prototype.SetUsers = function (users) {
            this.OtherUsers = {};
            var self = this;
            users.forEach(function (user) {
                self.OtherUsers[user.uId] = user;
            });
            this.redraw();
        };
        ;
        UserService.prototype.GetUserById = function (id) {
            return this.OtherUsers[id];
        };
        ;
        UserService.prototype.UpdatePosition = function (cursor) {
            if (this.OtherUsers[cursor.uId]) {
                this.OtherUsers[cursor.uId].pos.x = cursor.pos.x;
                this.OtherUsers[cursor.uId].pos.y = cursor.pos.y;
            }
            this.redraw();
        };
        ;
        UserService.prototype.redraw = function () {
            if (this.RedrawCallback) {
                this.RedrawCallback();
            }
        };
        ;
        UserService.name = "UserService";
        UserService.FactoryDefinition = [function () { return new UserService(); }];
        return UserService;
    })();
    return UserService;
});
//# sourceMappingURL=UserService.js.map